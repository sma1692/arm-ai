// AudioGen.ts
import { NativeModules } from 'react-native';


const AudioGenModule  = NativeModules.AudioGenModule;
if (!AudioGenModule) {
  console.warn("AudioGenModule is null – not linked or wrong name");
}
type AudioGenModuleType = {
  generate(prompt: string): Promise<string>;
};
export const AudioGen = AudioGenModule as AudioGenModuleType;
