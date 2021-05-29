using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ButtonUtils : MonoBehaviour {
    public IPadPanning pan;
    public void CloseObject(GameObject g)
    {
        g.SetActive(false);
        //Potential bug: if there are multiple PanBases, it will only return the first to be set
        pan.SetPanning(true);
    }

}
