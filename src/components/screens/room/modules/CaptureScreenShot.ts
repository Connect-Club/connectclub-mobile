import {captureScreen} from 'react-native-view-shot'

export class CaptureScreenShot {
  static takeScreenShot(): Promise<string> {
    return captureScreen({format: 'jpg', result: 'tmpfile'})
  }
}
