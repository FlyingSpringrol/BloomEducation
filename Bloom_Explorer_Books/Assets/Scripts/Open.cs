using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Open : OpenBase {

	public GameObject open;

	override public void updateUI(float t, PannerBase panner){
    	if (t < 1.0f){
            //ui stuff
    		pbground.SetActive(true);
    		prog.gameObject.SetActive(true);
    		prog.fillAmount = t;

    	}
    	else if (t > 1.0f){
            //ui stuff
    		pbground.SetActive(false);
    		prog.gameObject.SetActive(false);
            //state change stuff
    		open.SetActive(true);//turn on its open
    		panner.SetPanning(false); //make not pannable
            panner.SetActiveViewObject(open);
    	}
    }
}
