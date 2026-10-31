using UnityEngine;
using UnityEditor;

[InitializeOnLoad]
public class AutoDisableBlendShapesByName
{
    private static readonly string[] blendShapeNamesToDisable = { "Nipple_ON", "Nipple_big", "Nipple_small", "Bra_Nipple_ON", "bust_chikubi" }; // Add your blendshape names here

    static AutoDisableBlendShapesByName()
    {
        EditorApplication.hierarchyChanged += OnHierarchyChanged;
        Selection.selectionChanged += OnSelectionChanged;

        DisableBlendShapes();
    }

    private static void OnSelectionChanged()
    {
        DisableBlendShapes();
    }

    private static void OnHierarchyChanged()
    {
        DisableBlendShapes();
    }

    private static void DisableBlendShapes()
    {
        SkinnedMeshRenderer[] skinnedMeshRenderers = Object.FindObjectsOfType<SkinnedMeshRenderer>(true);

        foreach (var skinnedMeshRenderer in skinnedMeshRenderers)
        {
            if (skinnedMeshRenderer.sharedMesh != null)
            {
                foreach (string blendShapeName in blendShapeNamesToDisable)
                {
                    int index = skinnedMeshRenderer.sharedMesh.GetBlendShapeIndex(blendShapeName);

                    if (index != -1) // If the blendshape exists
                    {
                        skinnedMeshRenderer.SetBlendShapeWeight(index, 0);
                        Debug.Log($"BlendShape '{blendShapeName}' disabled on {skinnedMeshRenderer.gameObject.name}");
                    }
                    else
                    {
                        Debug.LogWarning($"BlendShape '{blendShapeName}' not found on {skinnedMeshRenderer.gameObject.name}");
                    }
                }
            }
            else
            {
                Debug.LogWarning($"No sharedMesh found on SkinnedMeshRenderer of {skinnedMeshRenderer.gameObject.name}");
            }

            EditorUtility.SetDirty(skinnedMeshRenderer);
        }
    }
}