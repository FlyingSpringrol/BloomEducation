using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class OpenUiElement : MonoBehaviour
{
    [SerializeField]
    private RectTransform UIObject;

    
    private UiViewControl uiControl;
    private void Start()
    {
        uiControl = GameObject.Find("UiViewControl").GetComponent<UiViewControl>();
        Debug.Log(uiControl);
    }
    public void OpenPopupUi()
    {
        uiControl.OpenPopupUiElement(UIObject);
    }
}
