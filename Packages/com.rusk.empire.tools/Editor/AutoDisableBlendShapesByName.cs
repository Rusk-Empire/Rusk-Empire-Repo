
using UnityEngine;
using UnityEditor;

[InitializeOnLoad]
public class AutoDisableBlendShapesByName
{
    private static readonly string[] blendShapeNamesToDisable =
    {
        "Nipple_ON",
        "Nipple_big",
        "Nipple_small",
        "Bra_Nipple_ON",
        "bust_chikubi"
    };

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
        SkinnedMeshRenderer[] skinnedMeshRenderers =
            Object.FindObjectsOfType<SkinnedMeshRenderer>(true);

        foreach (var skinnedMeshRenderer in skinnedMeshRenderers)
        {
            if (skinnedMeshRenderer.sharedMesh != null)
            {
                foreach (string blendShapeName in blendShapeNamesToDisable)
                {
                    int index = skinnedMeshRenderer.sharedMesh.GetBlendShapeIndex(blendShapeName);

                    // Only disable if the blendshape exists
                    if (index != -1)
                    {
                        skinnedMeshRenderer.SetBlendShapeWeight(index, 0);
                    }
                }
            }

            EditorUtility.SetDirty(skinnedMeshRenderer);
        }
    }
}
