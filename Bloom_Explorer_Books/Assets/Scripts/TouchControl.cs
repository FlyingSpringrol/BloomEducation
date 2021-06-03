using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TouchControl : MonoBehaviour
{
    private Vector2 lastTouch;

    private float yaw = 0.0f;
    private float pitch = 0.0f;

    private float xVel = 0.0f;
    private float yVel = 0.0f;
    public bool canPan = true;

    private float maxZoomDist = 5.0f; //how far camera can move during zoom
    private bool zoomStarted;
    private float firstDist;

    private Vector3 startCamPos;
    private Vector3 endCamPos;


    private bool firstClick;
    private float maxScroll = 5.0f;
    private float currZoomDist;

    void Start()
    {
        startCamPos = Camera.main.transform.position;
    }
    void Update()
    {
        UpdatePos();

        ReadTouchGestures();

        CheckRaycastHit();

    }
    float AddClamped(float val, float rot, float min, float max)
    {
        //something to clamp
        float newRot = val + rot;
        if (newRot <= max && newRot >= min)
        {
            return newRot;
        }
        else
        {
            return val;
        }
    }
    void CheckRaycastHit()
    {
        if (Input.touchCount == 1)
        {
            Touch touch = Input.GetTouch(0);
            Ray ray = Camera.main.ScreenPointToRay(touch.position);
            RaycastHit hit;
            if (Physics.Raycast(ray, out hit)) //hit an object
            {
                if (hit.collider != null && hit.transform.GetComponent<OpenUiElement>())
                {
                    canPan = false;
                    hit.transform.GetComponent<OpenUiElement>().OpenPopupUi();
                }
            }

        }
    }
    void UpdatePos()
    {
        //update 
        yaw -= xVel;
        pitch = AddClamped(pitch, yVel, -60.0f, 60.0f);
        Camera.main.transform.eulerAngles = new Vector3(pitch, yaw, 0.0f);
        xVel *= .7f;
        yVel *= .7f;
    }
    void ReadDesktopGestures()
    {


        // mouse pan detection
        if (Input.GetMouseButton(0) && canPan)
        {
            Vector2 pos = Input.mousePosition;

            if (firstClick)
            {
                lastTouch = pos;
                firstClick = false;

            }
            xVel += (pos.x - lastTouch.x) / 10.0f;
            yVel += (pos.y - lastTouch.y) / 10.0f;

        }
        else
        {
            firstClick = true;
        }
        // mouse wheel zoom detection
        if (canPan && Input.mouseScrollDelta.y != 0.0)
        {

            Vector2 between = Input.mousePosition;
            if (!zoomStarted)
            {
                zoomStarted = true;
                startCamPos = Camera.main.transform.position;
                endCamPos = Camera.main.ScreenToWorldPoint(new Vector3(between.x, between.y, maxScroll));
                return;
            }
            currZoomDist += Input.mouseScrollDelta.y * .01f;
            float zoom = Mathf.Clamp(currZoomDist, -maxScroll, maxScroll) /maxScroll;
            Camera.main.transform.position = startCamPos + (endCamPos - startCamPos) * zoom;

        }
        else
        {
            zoomStarted = false;
            Camera.main.transform.position = startCamPos;
        }
    }
    void ReadTouchGestures()
    {
        // touch pan detection
        if (Input.touchCount == 1 && canPan)
        {
            Touch touch = Input.GetTouch(0);
            Vector2 pos = touch.position;
            switch (touch.phase)
            {
                case TouchPhase.Began:
                    lastTouch = new Vector2(pos.x, pos.y);
                    break;
                case TouchPhase.Moved:
                    xVel += (pos.x - lastTouch.x) / 40.0f;
                    yVel += (pos.y - lastTouch.y) / 40.0f;
                    lastTouch = new Vector2(pos.x, pos.y);
                    break;
                case TouchPhase.Ended:
                    break;
            }

        }
        // touch zoom detection
        if (Input.touchCount == 2 && canPan)
        {
            Touch touch1 = Input.GetTouch(0);
            Touch touch2 = Input.GetTouch(1);

            Vector2 pos1 = touch1.position;
            Vector2 pos2 = touch2.position;
            Vector2 between = pos2 - pos1;
            float maxFingerDist = Mathf.Max(Screen.height, Screen.width);

            if (!zoomStarted)
            {
                zoomStarted = true;
                firstDist = Vector2.Distance(pos1, pos2);
                startCamPos = Camera.main.transform.position;
                endCamPos = Camera.main.ScreenToWorldPoint(new Vector3(between.x, between.y, maxZoomDist));
                return;
            }

            float currDiff = Vector2.Distance(pos1, pos2) - firstDist;
            float zoom = currDiff / maxFingerDist;
            Camera.main.transform.position = startCamPos + (endCamPos - startCamPos) * zoom;

        }
        else
        {
            zoomStarted = false;
            Camera.main.transform.position = startCamPos;
        }
    }
    void DetectHold()
    {
    }

}