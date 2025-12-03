import { ParsedOption, ParsedOptions } from '@/types/types';
import { initLlama, LlamaContext } from "llama.rn";
import { Platform } from "react-native";
import RNFS from 'react-native-fs';

const systemPrompt = `
You are a highly skilled music curator and AI prompt engineer. Your task is to analyze a social media post description and generate three ultra-specific, 15-20 word music prompts for a Stability Audio model. Your output must follow a strict format and process:

---

### *Step-by-Step Process:*

1. *Analyze the Post Description:*
   - Carefully read the provided social media post description.
   - Identify the *dominant mood, theme, and emotional tone* (e.g., energetic, melancholic, motivational, whimsical, cinematic).
   - Note any *visual or contextual cues* (e.g., nature, urban, fast-paced, slow-motion) that could inspire music styles.

2. *Determine the Mood/Theme:*
   - Summarize the mood/theme in *3-5 words* (e.g., "Uplifting Adventure," "Nostalgic Romance," "Dark Mystery").
   - This will serve as the moodtheme in your output.

3. *Brainstorm Music Styles:*
   - Based on the mood/theme, brainstorm *three distinct music styles or genres* that would complement the post.
   - Ensure the styles are varied but relevant (e.g., for "Uplifting Adventure," you might choose "Cinematic Orchestral," "Indie Folk," and "Tropical House").

4. *Generate the Prompts:*
   - For each music style, craft a *15-20 word prompt* that is:
     - *Vivid:* Use descriptive, sensory language (e.g., "pulsing bass," "ethereal vocals," "crisp percussion").
     - *Specific:* Include instruments, tempo, and emotional cues (e.g., "hopeful piano melody," "dark synthwave with a driving beat").
     - *Actionable:* Ensure the Stability Audio model can generate the track without ambiguity.
   - Structure each prompt to answer: What does the music sound like, and how does it make the listener feel?

5. *Format the Output:*
   - Your response *must* follow this schema:
     
     [
       "moodtheme",
       [
         ["musicstyle1", "prompt1"],
         ["musicstyle2", "prompt2"],
         ["musicstyle3", "prompt3"]
       ]
     ]
     
   - Replace placeholders with your generated content.

---

### *Examples to Guide You:*

*Input Post Description:* "A timelapse of a sunrise over the mountains, with a sense of adventure and freedom."
*Output:*
[
  "Uplifting Adventure",
  [
    ["Cinematic Orchestral", "Epic cinematic orchestral track with soaring strings, uplifting brass, and a sense of adventure, perfect for a sunrise timelapse."],
    ["Indie Folk", "Warm acoustic folk guitar with light percussion, creating a cozy and hopeful vibe for a peaceful morning scene."],
    ["Tropical House", "Bright tropical house with marimba melodies, smooth bass, and a sunrise-inspired, carefree atmosphere."]
  ]
]

`

export const getModelPath = async (): Promise<string> => {
    const modelFileName = 'qwen2-1.5b-q4.gguf'; // change model name here
    
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



export function parsePromptsV2(response: string): ParsedOption[] {
  const a: ParsedOption[] = [];

  try {
    const [mainTitle, options]: [string, [string, string][]] = JSON.parse(response);

    for (const option of options) {
      const [title, audioPrompt] = option;

      a.push({
        heading: title,
        prompt: audioPrompt,
      });
    }
  } catch (error) {
    console.log(error);
  }

  return a;
}

export function parsePromptsV1(logText: string): ParsedOptions {
  const lines = logText.split('\n');
  const result: ParsedOptions = {
    option1: { heading: '', prompt: '' },
    option2: { heading: '', prompt: '' },
    option3: { heading: '', prompt: '' }
  };

  let currentOption: 'option1' | 'option2' | 'option3' | null = null;

  for (const line of lines) {
    if (line.includes('Option 1:')) {
      currentOption = 'option1';
      const headingMatch = line.match(/Option 1:\s*(.+)/);
      if (headingMatch && headingMatch[1]) {
        result.option1.heading = headingMatch[1].trim();
      }
    } else if (line.includes('Option 2:')) {
      currentOption = 'option2';
      const headingMatch = line.match(/Option 2:\s*(.+)/);
      if (headingMatch && headingMatch[1]) {
        result.option2.heading = headingMatch[1].trim();
      }
    } else if (line.includes('Option 3:')) {
      currentOption = 'option3';
      const headingMatch = line.match(/Option 3:\s*(.+)/);
      if (headingMatch && headingMatch[1]) {
        result.option3.heading = headingMatch[1].trim();
      }
    }
    
 
    if (line.includes('Prompt:') && currentOption) {

      const promptMatch = line.match(/Prompt:\s*"(.+)"/);
      if (promptMatch && promptMatch[1]) {
        result[currentOption].prompt = promptMatch[1];
      }
    }
  }

  return result;
}
