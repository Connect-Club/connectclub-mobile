// Generated file. See scripts/init.js for details.
export type ReleaseStage = 'testing' | 'staging' | 'production'
export type BuildType = 'dev' | 'qa' | 'release'
export type BuildFeature = 'regular' | 'host'

export interface BuildConfig {
  readonly releaseStage: ReleaseStage
  readonly buildType: BuildType
  readonly buildFeatures: Array<BuildFeature>
}

const buildConfig: BuildConfig = {
  releaseStage: 'staging',
  buildType: 'dev',
  buildFeatures: ["host"],
}

export default buildConfig
