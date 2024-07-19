import { ClusterOptions } from './cluster'

/**
 * IConfigProfile specifies a ConfigProfile which applies
 * specified option values to ConnectionOptions.
 *
 * Volatile: This API is subject to change at any time.
 */
export interface IConfigProfile {
  /**
   * Applies the ConfigProfile options to the provided ClusterOptions.
   *
   * Volatile: This API is subject to change at any time.
   *
   * @param options The Connect options the ConfigProfile should be applied toward.
   */
  apply(options: ClusterOptions): void
}

/**
 * The WAN Development profile sets various timeout options that are useful
 * when working in a WAN environment.
 *
 * Volatile: This API is subject to change at any time.
 */
export class WanDevelopmentProfile implements IConfigProfile {
  /**
   * Applies the ConfigProfile options to the provided ClusterOptions.
   *
   * Volatile: This API is subject to change at any time.
   *
   * @param options The Connect options the ConfigProfile should be applied toward.
   */
  apply(options: ClusterOptions): void {
    // the profile should override previously set values
    options.timeoutOptions = {
      ...options.timeoutOptions,
      ...{
        queryTimeout: 120000,
        managementTimeout: 120000,
        connectTimeout: 120000,
        dispatchTimeout: 60000,
        socketConnectTimeout: 20000,
        resolveTimeout: 20000,
      },
    }
    options.dnsConfig = { ...options.dnsConfig, ...{ dnsSrvTimeout: 20000 } }
  }
}

/**
 * The ConfigProfiles class keeps track of registered/known Configuration Profiles.
 *
 * Volatile: This API is subject to change at any time.
 */
export class ConfigProfiles {
  private _profiles: { [profileName: string]: IConfigProfile }

  constructor() {
    this._profiles = {}
    this.registerProfile('wanDevelopment', new WanDevelopmentProfile())
  }

  /**
   * Applies the specified registered ConfigProfile to the provided ClusterOptions.
   *
   * Volatile: This API is subject to change at any time.
   *
   *  @param profileName The name of the ConfigProfile to apply.
   *  @param options The Connect options the ConfigProfile should be applied toward.
   */
  applyProfile(profileName: string, options: ClusterOptions): void {
    if (!(profileName in this._profiles)) {
      throw new Error(`${profileName} is not a registered profile.`)
    }
    this._profiles[profileName].apply(options)
  }

  /**
   * Registers a ConfigProfile under the specified name.
   *
   * Volatile: This API is subject to change at any time.
   *
   *  @param profileName The name the ConfigProfile should be registered under.
   *  @param profile The ConfigProfile to register.
   */
  registerProfile(profileName: string, profile: IConfigProfile): void {
    this._profiles[profileName] = profile
  }

  /**
   * Unregisters the specified ConfigProfile.
   *
   * Volatile: This API is subject to change at any time.
   *
   *  @param profileName The name of the ConfigProfile to unregister.
   */
  unregisterProfile(profileName: string): void {
    delete this._profiles[profileName]
  }
}

export const knownProfiles = new ConfigProfiles()
