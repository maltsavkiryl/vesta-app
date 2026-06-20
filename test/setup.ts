import type { ReactNode } from "react"
// we always make sure 'react-native' gets included first
// eslint-disable-next-line no-restricted-imports
import * as ReactNative from "react-native"

import mockFile from "./mockFile"

// libraries to mock
jest.doMock("react-native", () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      Image: {
        ...ReactNative.Image,
        resolveAssetSource: jest.fn(() => mockFile),
        getSize: jest.fn(
          (
            _uri: string,
            success: (width: number, height: number) => void,
            _failure?: (_error: any) => void,
          ) => success(100, 100),
        ),
      },
    },
    ReactNative,
  )
})

jest.mock("react-native-mmkv", () => {
  const React = require("react")
  const { createMockMMKV } = require("react-native-mmkv/lib/createMMKV/createMockMMKV")

  const defaultStorage = createMockMMKV()

  const useStoredValue = <T>(
    key: string,
    getter: (storage: ReturnType<typeof createMockMMKV>, storageKey: string) => T,
    setter: (
      storage: ReturnType<typeof createMockMMKV>,
      storageKey: string,
      value: T | undefined,
    ) => void,
    instance = defaultStorage,
  ) => {
    const [value, setValue] = React.useState<T | undefined>(() => getter(instance, key))

    React.useEffect(() => {
      setValue(getter(instance, key))

      return instance.addOnValueChangedListener((changedKey: string) => {
        if (changedKey === key) {
          setValue(getter(instance, key))
        }
      }).remove
    }, [getter, instance, key])

    const setStoredValue = (
      nextValue: T | ((current: T | undefined) => T | undefined) | undefined,
    ) => {
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(getter(instance, key)) : nextValue
      setter(instance, key, resolvedValue)
      setValue(getter(instance, key))
    }

    return [value, setStoredValue] as const
  }

  return {
    createMMKV: (config?: { id?: string }) => createMockMMKV(config),
    useMMKV: () => defaultStorage,
    useMMKVString: (key: string, instance = defaultStorage) =>
      useStoredValue<string>(
        key,
        (storage, storageKey) => storage.getString(storageKey),
        (storage, storageKey, value) => {
          if (value == null) {
            storage.remove(storageKey)
            return
          }
          storage.set(storageKey, value)
        },
        instance,
      ),
    useMMKVBoolean: (key: string, instance = defaultStorage) =>
      useStoredValue<boolean>(
        key,
        (storage, storageKey) => storage.getBoolean(storageKey),
        (storage, storageKey, value) => {
          if (value == null) {
            storage.remove(storageKey)
            return
          }
          storage.set(storageKey, value)
        },
        instance,
      ),
    useMMKVNumber: (key: string, instance = defaultStorage) =>
      useStoredValue<number>(
        key,
        (storage, storageKey) => storage.getNumber(storageKey),
        (storage, storageKey, value) => {
          if (value == null) {
            storage.remove(storageKey)
            return
          }
          storage.set(storageKey, value)
        },
        instance,
      ),
    useMMKVObject: (key: string, instance = defaultStorage) =>
      useStoredValue<object>(
        key,
        (storage, storageKey) => {
          const value = storage.getString(storageKey)
          return value ? JSON.parse(value) : undefined
        },
        (storage, storageKey, value) => {
          if (value == null) {
            storage.remove(storageKey)
            return
          }
          storage.set(storageKey, JSON.stringify(value))
        },
        instance,
      ),
    useMMKVKeys: (instance = defaultStorage) => {
      const [keys, setKeys] = React.useState<string[]>(() => instance.getAllKeys())

      React.useEffect(() => {
        setKeys(instance.getAllKeys())

        return instance.addOnValueChangedListener(() => {
          setKeys(instance.getAllKeys())
        }).remove
      }, [instance])

      return keys
    },
    useMMKVListener: (listener: (key: string) => void, instance = defaultStorage) => {
      React.useEffect(
        () => instance.addOnValueChangedListener(listener).remove,
        [instance, listener],
      )
    },
  }
})

jest.mock("i18next", () => {
  // Resolve a namespaced i18n key (e.g. "home:upcoming.empty") against the en translations.
  // Falls back to returning the raw key if the path isn't found.
  function resolveKey(key: string, params?: Record<string, unknown>): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const en = require("../src/i18n/en").default as Record<string, unknown>
    const [ns, ...rest] = key.split(":")
    const path = rest.length > 0 ? [ns, ...rest[0].split(".")] : ns.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = en
    for (const segment of path) {
      if (node == null || typeof node !== "object") return key
      node = node[segment]
    }
    if (typeof node !== "string") return key
    if (!params) return node
    // Simple {{variable}} interpolation
    return node.replace(/\{\{(\w+)\}\}/g, (_, name) =>
      params[name] != null ? String(params[name]) : `{{${name}}}`,
    )
  }

  return {
    currentLocale: "en",
    isInitialized: true,
    t: resolveKey,
    translate: resolveKey,
  }
})

jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "en-US", textDirection: "ltr" }],
}))

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Heavy: "heavy",
    Light: "light",
    Medium: "medium",
    Rigid: "rigid",
    Soft: "soft",
  },
  NotificationFeedbackType: {
    Error: "error",
    Success: "success",
    Warning: "warning",
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}))

jest.mock("react-native-reanimated", () => {
  const React = require("react")
  const { View } = require("react-native")

  const AnimatedView = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
    React.createElement(View, { ...props, ref }, props.children),
  )
  AnimatedView.displayName = "AnimatedView"

  const interpolate = (value: number, input: number[], output: number[]) => {
    if (input.length < 2 || output.length < 2) {
      return output[0] ?? value
    }

    const [inputStart, inputEnd] = [input[0], input[input.length - 1]]
    const [outputStart, outputEnd] = [output[0], output[output.length - 1]]
    if (inputEnd === inputStart) {
      return outputStart
    }

    const progress = (value - inputStart) / (inputEnd - inputStart)
    return outputStart + progress * (outputEnd - outputStart)
  }

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (Component: unknown) => Component,
    },
    Easing: {
      bezier: () => (value: number) => value,
      cubic: (value: number) => value,
      ease: (value: number) => value,
      inOut: (easing: unknown) => easing,
      linear: (value: number) => value,
      out: (easing: unknown) => easing,
      quad: (value: number) => value,
    },
    Extrapolation: {
      CLAMP: "clamp",
    },
    cancelAnimation: jest.fn(),
    LinearTransition: {
      springify: () => ({
        damping: () => ({
          stiffness: () => ({}),
        }),
      }),
    },
    View: AnimatedView,
    createAnimatedComponent: (Component: unknown) => Component,
    interpolate,
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    useSharedValue: (value: unknown) => ({ value }),
    withDelay: (_delay: number, value: unknown) => value,
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[values.length - 1],
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  }
})

jest.mock("react-native-keyboard-controller", () => {
  const React = require("react")
  const { ScrollView } = require("react-native")

  const KeyboardAwareScrollView = React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement(ScrollView, { ...props, ref }, children),
  )
  KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView"

  return {
    KeyboardAwareScrollView,
    KeyboardProvider: ({ children }: { children: ReactNode }) => children,
  }
})

jest.mock("react-native-worklets", () => ({
  __esModule: true,
  createSerializable: (value: unknown) => value,
  createWorkletRuntime: jest.fn(),
  makeMutable: (value: unknown) => ({ value }),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  runOnUI: (fn: (...args: unknown[]) => unknown) => fn,
  useSharedValue: (value: unknown) => ({ value }),
}))

jest.mock("../src/i18n/index.ts", () => ({
  i18n: {
    isInitialized: true,
    language: "en",
    t: (key: string, params: Record<string, string>) => {
      return `${key} ${JSON.stringify(params)}`
    },
    numberToCurrency: jest.fn(),
  },
}))

jest.mock("@/providers/motion-provider", () => ({
  MotionProvider: ({ children }: { children: ReactNode }) => children,
  useAppMotion: () => ({
    enterDistance: 0,
    enterDuration: 0,
    mode: "full",
    preference: "system",
    prefersReducedMotion: false,
    shouldReduceMotion: false,
    staggerStep: 0,
  }),
}))

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
  let __TEST__: boolean
}
