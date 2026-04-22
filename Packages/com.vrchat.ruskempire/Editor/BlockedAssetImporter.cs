using UnityEditor;
using UnityEngine;
using System.IO;

[InitializeOnLoad]
public class BlockedAssetImporter : AssetPostprocessor
{
    static string[] blockedKeywords = new string[] 
    {
        "Rusk_Body_nude",
        "Mint_Body_nude",
        "Milk-Re_Body_nude",
        "Lime_Body_2",
        "Karin_Body_R18",
        "Chiffon_Body_2",
        "Chocolat_Body_2",
        "Plum_Body_2",
        "Plum_Body_Kaihen_2",
        "Body_2"
    };

    static BlockedAssetImporter()
    {
        // This runs when the script is imported or recompiled
        CheckForBlockedAssets();
    }

    static void CheckForBlockedAssets()
    {
        // Loop through all assets and check if any match the blocked keywords
        string[] allAssets = AssetDatabase.GetAllAssetPaths();
        
        foreach (var path in allAssets)
        {
            string fileName = Path.GetFileName(path).ToLowerInvariant();

            foreach (var keyword in blockedKeywords)
            {
                if (fileName.Contains(keyword.ToLowerInvariant()))
                {
                    Debug.Log($"Blocked asset detected and deleted: {path}");
                    AssetDatabase.DeleteAsset(path);
                    break;
                }
            }
        }
    }

    static void OnPostprocessAllAssets(string[] importedAssets, string[] deletedAssets,
        string[] movedAssets, string[] movedFromAssetPaths)
    {
        foreach (var path in importedAssets)
        {
            string fileName = Path.GetFileName(path).ToLowerInvariant();

            foreach (var keyword in blockedKeywords)
            {
                if (fileName.Contains(keyword.ToLowerInvariant()))
                {
                    Debug.Log($"Blocked asset detected and deleted: {path}");
                    AssetDatabase.DeleteAsset(path);
                    break;
                }
            }
        }
    }
}