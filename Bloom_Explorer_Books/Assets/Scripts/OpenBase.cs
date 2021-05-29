using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class OpenBase : MonoBehaviour {
    protected Image prog;
    protected GameObject pbground;
    // Use this for initialization
    public virtual void updateUI(float t, PannerBase panner) { }

    void Start()
    {
        prog = this.getChildGameObject("progress").transform.GetComponent<Image>();
        pbground = this.getChildGameObject("pbground");
        prog.gameObject.SetActive(false);
        pbground.SetActive(false);
    }
    public GameObject getChildGameObject(string withName)
    {
        foreach (Transform t in this.GetComponentsInChildren<Transform>(true))
        {
            if (t.name == withName)
            {
                return t.gameObject;
            }
        }
        return null;
    }
    public void zeroUI()
    {
        prog.fillAmount = 0.0f;
        prog.gameObject.SetActive(false);
        pbground.SetActive(false);
    }

}
