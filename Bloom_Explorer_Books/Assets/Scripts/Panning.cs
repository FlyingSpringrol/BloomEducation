using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Panning : PannerBase {


    public float speedH = 2.0f;
    public float speedV = 2.0f;

    private float yaw = 0.0f;
    private float pitch = 0.0f;

    private bool holding = false;
    private float timeHeld = 0.0f;
    private float toHold = .25f;
	private OpenBase activeOpen;

    void DetectHold()
    {
        if (Input.GetMouseButton(0))
        {
            RaycastHit hit;
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            if (Physics.Raycast(ray, out hit))
            {
                if (hit.collider != null && holding && hit.transform.GetComponent<OpenBase>())
                {
					activeOpen = hit.transform.GetComponent<OpenBase>();
                    timeHeld += Time.deltaTime;
                    float t = timeHeld/toHold;
                    hit.transform.GetComponent<OpenBase>().updateUI(t, this);
                }
                else if (hit.collider != null && !holding)
				{
					holding = true;
					timeHeld = 0.0f;
				}
				else
				{
					holding = false;
				}
			}

		}
		else
		{
            if (activeOpen)
			{
                //clear active ui
				activeOpen.zeroUI();
			}
			holding = false;
		}
    }
    void DetectPan()
    {
        yaw += speedH * Input.GetAxis("Mouse X");
        pitch -= speedV * Input.GetAxis("Mouse Y");

        Camera.main.transform.eulerAngles = new Vector3(pitch, yaw, 0.0f);

    }
    void DetectKeyDown()
    {
        if (Input.GetKeyUp(KeyCode.LeftArrow))
        {
            Camera.main.transform.position += new Vector3(0.0f, 0.0f, 20.0f);
        }

        if (Input.GetKeyUp(KeyCode.RightArrow))
        {
            Camera.main.transform.position -= new Vector3(0.0f, 0.0f, 20.0f);
        }
    }
    void Update()
    {
        if (canPan)
        {
            DetectPan();
        }
        //always detect clicks
        DetectHold();
        DetectKeyDown();
    }

}
