using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PannerBase : MonoBehaviour {
    protected float timeHeld = 0.0f;
    protected bool canPan = true;
    protected GameObject activeViewUI;
    protected float timeSinceDisabled;

    public void SetActiveViewObject(GameObject g)
    {
        activeViewUI = g;
    }
    public void SetPanning(bool yesNo) //lock panning or not
    {
        canPan = yesNo;
        timeHeld = 0.0f; //reset the time held field
        timeSinceDisabled = Time.time; //save when it was disabled
    }

}
