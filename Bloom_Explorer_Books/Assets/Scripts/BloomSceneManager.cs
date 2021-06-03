using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class BloomSceneManager : MonoBehaviour
{
    public void LoadMainMenu()
    {
        SceneManager.LoadScene("_mainMenu");
    }
    public void LoadScene(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }
}
