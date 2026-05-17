export interface ConfigBaseProps {
  API_URL: string
  DEMO_AUTH_ENABLED: boolean
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]

const BaseConfig: ConfigBaseProps = {
  API_URL: "",
  DEMO_AUTH_ENABLED: false,

  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "dev",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["Welcome"],
}

export default BaseConfig
