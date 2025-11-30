import { initLlama, LlamaContext } from "llama.rn";
import { Platform } from "react-native";
import RNFS from 'react-native-fs';

const systemPrompt = ` ### **Step-by-Step Instructions:**
            1. **Analyze the Post Description:**
            - Read the provided social media post description with attention to:
                - **Emotional tone** (e.g., joyful, nostalgic, intense, whimsical, dramatic).
                - **Visual or thematic elements** (e.g., nature, urban, fast-paced, slow-motion).
                - **Purpose or vibe** (e.g., motivational, relaxing, suspenseful, celebratory).
            - Ask yourself: *What kind of music would make this post feel complete? What emotions should the music evoke in the viewer?*
            2. **Identify Three Distinct Music Directions:**
            - Brainstorm three unique music styles or genres that align with the post's mood and purpose.
            - Ensure variety: For example, if the post is "energetic," options could range from "high-tempo electronic" to "upbeat indie rock" to "tribal drum-heavy."
            - Avoid overlap; each option should offer a different auditory experience.
            3. **Craft the Prompts:**
            - For each music style, write a **15-20 word prompt** that is:
                - **Vivid:** Use sensory language (e.g., "pulsing bass," "ethereal vocals," "crisp percussion").
                - **Specific:** Include instruments, tempo, and emotional cues (e.g., "hopeful piano melody," "dark synthwave with a driving beat").
                - **Actionable:** Phrase it so the Stability Audio model can generate the track without ambiguity.
            - Structure each prompt to answer: *What does the music sound like, and how does it make the listener feel?*
            4. **Output Format:**
            Use this template for your response:
            5. **Examples to Guide You:**
            - **Post:** "A slow-motion video of a dancer in a neon-lit alley at night."
            **Mood/Theme:** Mysterious, urban, hypnotic
            ---
            Option 1: Dark Synthwave
            Prompt: "Moody synthwave with a slow, hypnotic bassline, neon-soaked pads, and a sense of late-night intrigue."
            Option 2: Cinematic Hip-Hop
            Prompt: "Atmospheric hip-hop beat with deep 808s, haunting flute samples, and a brooding, cinematic edge."
            Option 3: Ambient Downtempo
            Prompt: "Downtempo electronic with glitchy textures, soft arpeggios, and a dreamy, introspective atmosphere."
            - **Post:** "A family picnic in a sunlit meadow, laughing and playing."
            **Mood/Theme:** Warm, joyful, nostalgic
            ---
            Option 1: Acoustic Folk
            Prompt: "Bright acoustic guitar plucking, light hand claps, and a cheerful, nostalgic melody evoking summer memories."
            Option 2: Indietronica
            Prompt: "Upbeat indietronica with sparkling synths, playful xylophone, and a carefree, sunny vibe."
            Option 3: Lo-Fi Jazz
            Prompt: "Warm lo-fi jazz with a lazy trumpet riff, soft drums, and a cozy, intimate feel."
            ---
            ### **Rules to Follow:**
            - Never exceed 20 words per prompt.
            - Avoid generic terms like "cool" or "nice." Instead, use descriptive adjectives (e.g., "gritty," "lush," "pulsing").
            - Tailor the music to the post's emotional core. If the post feels "epic," lean into grand, cinematic language.
            - Prioritize clarity: The Stability Audio model should "hear" the music in your words.
            ---
            ### **Begin the Task:**
            Here is the social media post description:
            "[Insert user's description here]"
            Take a deep breath, imagine the scene, and generate three perfect music prompts.`

export const getModelPath = async (): Promise<string> => {
    const modelFileName = 'qwen2-1.5b-q4.gguf';
    
    if (Platform.OS === 'android') {
      // For Android, first copy from assets to cache/documents
      const destPath = `${RNFS.DocumentDirectoryPath}/${modelFileName}`;
      
      // Check if already copied
      const exists = await RNFS.exists(destPath);
      if (exists) {
        console.log('Model found in documents:', destPath);
        return destPath;
      }
      
      // Copy from assets to accessible location
      console.log('Copying model from assets...');
      try {
        await RNFS.copyFileAssets(modelFileName, destPath);
        console.log('Model copied successfully to:', destPath);
        return destPath;
      } catch (copyError) {
        console.error('Failed to copy from assets:', copyError);
        throw new Error(`Failed to copy model from assets. Make sure ${modelFileName} is in android/app/src/main/assets/`);
      }
    } else {
      // iOS - file should be in bundle
      return modelFileName;
    }
};




// loading a model
export async function loadModel (){
    try {
        const modelPath = await getModelPath()
        return initLlama({
            model:modelPath,
            n_ctx: 1024,
            n_threads: 6,
            use_mlock: false,
        })
    } catch (error) {
        console.log(`Error in loadModel ${error}`)
        return null
    }
}


export async function chat(prompt: string, model: LlamaContext): Promise<string | null> {
  try {
    const result = await model.completion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      n_predict: 256,
      temperature: 0.7,
    });
    return result.text;
  } catch (error) {
    console.log('Error in chat', error);
    return null;
  }
}






