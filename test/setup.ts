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
        resolveAssetSource: jest.fn((_source) => mockFile), // eslint-disable-line @typescript-eslint/no-unused-vars
        getSize: jest.fn(
          (
            uri: string, // eslint-disable-line @typescript-eslint/no-unused-vars
            success: (width: number, height: number) => void,
            failure?: (_error: any) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
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
    }, [instance, key])

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

jest.mock("i18next", () => ({
  currentLocale: "en",
  t: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
  translate: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
}))

jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "en-US", textDirection: "ltr" }],
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

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
  let __TEST__: boolean
}
