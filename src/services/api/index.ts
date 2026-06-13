/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApisauceInstance, create } from "apisauce"

import Config from "@/config"
import { createAuthService } from "@/services/auth/authService"

import { createHttpClient } from "./httpClient"
import type { ApiConfig } from "./types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }
}

// Singleton instance of the API for convenience
export const api = new Api()

// Every request to the backend must carry the API key and api-version.
api.apisauce.setHeader("X-Api-Key", Config.AUTH.apiKey)
api.apisauce.addRequestTransform((request) => {
  request.params = { "api-version": "1.0", ...(request.params ?? {}) }
})

// Auth-bound services. Created AFTER the header/transform setup so every
// request these issue inherits the API key and api-version configuration.
export const authService = createAuthService(api.apisauce)
export const httpClient = createHttpClient(api.apisauce, () => authService.reauthenticate())
