using System.Collections;
using System.Collections.Generic;
using LeTai.TrueShadow;
using UnityEngine;
using UnityEngine.UI;

public class UiViewControl : MonoBehaviour
{
    [SerializeField]
    private TouchControl touchController;
    [SerializeField]
    private ScrollRect popupRect;

    [SerializeField]
    private RectTransform[] storyPages;
    [SerializeField]
    private ScrollRect storyRect;

    [SerializeField]
    private Button leftButton;
    [SerializeField]
    private Button rightButton;

    private GameObject currActive;
    private RectTransform currStory;
    private int currStoryIdx = 0;

    [SerializeField]
    private GameObject sceneParent;

    [SerializeField]
    private GameObject exitPopup;

    private void Start()
    {
        rightButton.onClick.AddListener(NavForward);
        leftButton.onClick.AddListener(NavBack);
        CheckHideButton();
        SetStoryScrollRectContent();
    }
    private void SetButtonVisibility(GameObject g, bool active)
    {
        Image i = g.gameObject.GetComponent<Image>();
        TrueShadow t = g.gameObject.GetComponent<TrueShadow>();
        Button b = g.gameObject.GetComponent<Button>();
        i.enabled = active;
        t.enabled = active;
        b.enabled = active;
    }
    private void CheckHideButton()
    {
        if (currStoryIdx <= 0)
        {
            SetButtonVisibility(leftButton.gameObject, false);
        }
        else if (currStoryIdx >= storyPages.Length - 1)
        {
            SetButtonVisibility(rightButton.gameObject, false);
        }
        else
        {
            SetButtonVisibility(leftButton.gameObject, true);
            SetButtonVisibility(rightButton.gameObject, true);
        }
    }
    private void SwitchScene(bool forward)
    {
        if (forward && currStoryIdx < storyPages.Length)
        {
            sceneParent.transform.position += new Vector3(0.0f, 0.0f, 20.0f);

        }
        else if (!forward && currStoryIdx >= 0)
        {
            sceneParent.transform.position -= new Vector3(0.0f, 0.0f, 20.0f);

        }
    }
    private void SetStoryScrollRectContent()
    {
        currStory = storyPages[currStoryIdx];
        storyRect.content = currStory;
    }
    public void NavBack()
    {
        CloseActive();

        currStoryIdx -= 1;
        SetStoryScrollRectContent();
        CheckHideButton();
        SwitchScene(forward: false);


    }
    //used by left and right buttons
    public void NavForward()
    {
        CloseActive();

        currStoryIdx += 1;
        SetStoryScrollRectContent();
        CheckHideButton();

        SwitchScene(forward: true);
    }
    public void OpenActiveStory()
    {
        CloseActive();
        touchController.canPan = false;
        currStory.gameObject.SetActive(true);
        storyRect.gameObject.SetActive(true);
    }
    public void OpenPopupUiElement(RectTransform targetRectTransform)
    {
        touchController.canPan = false;
        popupRect.gameObject.SetActive(true);
        if (currActive)
        {
            currActive.SetActive(false);
        }
        if (targetRectTransform)
        {
            targetRectTransform.gameObject.SetActive(true);
        }
        currActive = targetRectTransform.gameObject;
        //set curr popup scrollbar content, architected in a weird way where this is one scrollbar, and many content objects
        popupRect.content = targetRectTransform;
    }
    //interface to close all scroll rects and hide their active children.
    public void CloseActive()
    {
        if (currActive)
        {
            currActive.SetActive(false);
        }
        if (currStory)
        {
            currStory.gameObject.SetActive(false);
        }
        popupRect.gameObject.SetActive(false);
        storyRect.gameObject.SetActive(false);

        touchController.canPan = true;
    }

    //button utilities
    public void OpenExit()
    {
        //close active
        CloseActive();
        //set curr active
        currActive = exitPopup;
        //disable panning
        touchController.canPan = false;
        //exit
        exitPopup.SetActive(true);

    }
}
