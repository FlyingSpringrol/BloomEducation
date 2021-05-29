using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class IPadPanning : PannerBase {

    //page toggling api
    [SerializeField] private GameObject[] pages;
    private int activePage;
    [SerializeField]
    private Text page;
    [SerializeField]
    private GameObject last;
    [SerializeField]
    private GameObject next;

    private bool holding_ui = false;
    private float toHold = .4f;
	private OpenBase activeOpen;
    private Vector2 lastTouch;
    private bool isPanning;
    private float yaw = 0.0f;
    private float pitch = 0.0f;

    private float xVel = 0.0f;
    private float yVel = 0.0f;

    private void CheckStates()
    {
        if (this.activePage == 0)
        {
            last.gameObject.SetActive(false);
        }
        else
        {
            last.gameObject.SetActive(true);
        }
        if (this.activePage == pages.Length - 1)
        {
            next.gameObject.SetActive(false);
        }
        else
        {
            next.gameObject.SetActive(true);
        }
    }
    public void ToggleMainPage()
    {
		//turn off activeViewUI if main page toggled
		if (!pages[activePage].activeInHierarchy)
        {
            if (this.activeViewUI) //if different than the current page
            {
                this.activeViewUI.SetActive(false);
            }
            pages[activePage].SetActive(true);
            this.SetPanning(false);
            activeViewUI = pages[activePage];
        }
        else
        {
			//turn off and resume panning
			pages[activePage].SetActive(false);
            this.SetPanning(true);
            activeViewUI = pages[activePage];
        }

    }
    public void NextPage()
    {
        if (this.activeViewUI)
        {
            this.activeViewUI.SetActive(false);
        }
        pages[activePage].SetActive(false);

        Camera.main.transform.position -= new Vector3(0.0f, 0.0f, 20.0f) ;
        activePage++;
        page.text = "Page " + (activePage + 1).ToString();
        CheckStates();

    }
    public void LastPage()
    {
        if (this.activeViewUI)
        {
            this.activeViewUI.SetActive(false);
        }
        pages[activePage].SetActive(false);

        Camera.main.transform.position += new Vector3(0.0f, 0.0f, 20.0f);
        activePage--;
        page.text = "Page " + (activePage + 1).ToString();
        CheckStates();

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
    void UpdatePos()
    {
        //update 
        yaw -= xVel;
        pitch = AddClamped(pitch, yVel, -60.0f, 60.0f);
        Camera.main.transform.eulerAngles = new Vector3(pitch, yaw, 0.0f);
        xVel = xVel * .7f;
        yVel = yVel * .7f;
    }
    void DetectHold() {
        if (Input.touchCount > 0 && canPan)
        {
            Touch touch = Input.GetTouch(0);
            Vector2 pos = touch.position;
            RaycastHit hit;
            Ray ray = Camera.main.ScreenPointToRay(pos);
            if (Physics.Raycast(ray, out hit)) //hit an object
            {
                if (hit.collider != null && hit.transform.GetComponent<OpenBase>())
                {
					activeOpen = hit.transform.GetComponent<OpenBase>();
                    timeHeld += Time.deltaTime;
                    float t = timeHeld/toHold;
                    hit.transform.GetComponent<OpenBase>().updateUI(t, this);
                }
			}
            else { //is panning, because not hitting anything: may be issue when finger crosses an element
                if (isPanning)
                {
                    //update  my velocities
                    float xRot = (pos.x - lastTouch.x) / 40.0f; //10.0 is pixels cross per rotation
                    float yRot = (pos.y - lastTouch.y) / 40.0f;
                    xVel += xRot;
                    yVel += yRot;
                    //update
                    lastTouch = new Vector2(pos.x, pos.y);

                }
                else //not panning yet
                {
                    isPanning = true;
                    lastTouch = new Vector2(pos.x, pos.y);
                }
            }

		}
        else if (Input.touchCount > 0 && !canPan)
        {
            //means something is open
            Touch touch = Input.GetTouch(0);
            Vector2 pos = touch.position;
            int width = Screen.width;
            int height = Screen.height;
            int x_diff = width / 8;
            if ((pos.x < x_diff || pos.x > width - x_diff) && (Time.time - this.timeSinceDisabled > .5f)) //prevent accidental clicks
            {
                //treat this as turning off the image, turn on panning again
                if (this.activeViewUI)
                {
                    this.activeViewUI.SetActive(false);
                }
                canPan = true;

            }
        }
        //clear, because touching nothing 
        else
		{
            //have released the screen 
            if (activeOpen)
			{
                //clear active ui
				activeOpen.zeroUI();
			}
            timeHeld = 0.0f;
            isPanning = false;
			holding_ui = false;
		}
    }
    private void Start()
    {
        CheckStates();
    }
    void Update()
    {
        DetectHold();
        UpdatePos();
    }

}
