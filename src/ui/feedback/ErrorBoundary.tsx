import { Component, type ErrorInfo, type ReactNode } from "react"

import { reportCrash } from "@/utils/crashReporting"

import { ErrorDetails } from "./ErrorDetails"

interface Props {
  catchErrors: "always" | "dev" | "prod" | "never"
  children: ReactNode
}

interface State {
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  state = { error: null, errorInfo: null }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (!this.isEnabled()) return

    this.setState({ error, errorInfo })
    reportCrash(error)
  }

  resetError = () => {
    this.setState({ error: null, errorInfo: null })
  }

  shouldComponentUpdate(_nextProps: Readonly<Props>, nextState: Readonly<State>) {
    return nextState.error !== this.state.error
  }

  isEnabled() {
    return (
      this.props.catchErrors === "always" ||
      (this.props.catchErrors === "dev" && __DEV__) ||
      (this.props.catchErrors === "prod" && !__DEV__)
    )
  }

  render() {
    return this.isEnabled() && this.state.error ? (
      <ErrorDetails
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onReset={this.resetError}
      />
    ) : (
      this.props.children
    )
  }
}
