import { useState, useEffect, useCallback } from 'react';

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Ppgts9_nG/";

export function useTeachableMachine() {
    const [model, setModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadModel() {
            try {
                if (!window.tmImage) {
                    throw new Error("Teachable Machine library not found");
                }

                const modelURL = MODEL_URL + "model.json";
                const metadataURL = MODEL_URL + "metadata.json";

                const loadedModel = await window.tmImage.load(modelURL, metadataURL);
                setModel(loadedModel);
                setIsModelLoading(false);
                console.log("Teachable Machine model loaded");
            } catch (err) {
                console.error("Failed to load Teachable Machine model:", err);
                setError(err);
                setIsModelLoading(false);
            }
        }

        loadModel();
    }, []);

    const predict = useCallback(async (imageElement) => {
        if (!model || !imageElement) return null;
        try {
            const prediction = await model.predict(imageElement);
            // Sort by probability
            prediction.sort((a, b) => b.probability - a.probability);
            return prediction;
        } catch (err) {
            console.error("Prediction failed:", err);
            return null;
        }
    }, [model]);

    return { model, isModelLoading, predict, error };
}
