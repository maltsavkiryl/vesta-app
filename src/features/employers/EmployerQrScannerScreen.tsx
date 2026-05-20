import { useRef } from "react"
import { Alert, Pressable, StyleSheet, View } from "react-native"
import { Stack, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AppButton, Text, useDesignTokens } from "@/ui"
import { fireHaptic } from "@/utils/haptics"

import { parseQrInviteCodePayload } from "./employerInviteCode"
import { setPendingEmployerInviteCode } from "./employerQrScanSession"

export function EmployerQrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const handlingScanRef = useRef(false)
  const tokens = useDesignTokens()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const closeScanner = () => router.back()

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (handlingScanRef.current) return
    handlingScanRef.current = true

    const parsedCode = parseQrInviteCodePayload(data)
    if (!parsedCode) {
      fireHaptic("warning")
      Alert.alert("Invalid QR code", "This QR code does not contain a 6-digit invite code.", [
        {
          text: "OK",
          onPress: () => {
            handlingScanRef.current = false
          },
        },
      ])
      return
    }

    fireHaptic("success")
    setPendingEmployerInviteCode(parsedCode)
    closeScanner()
  }

  return (
    <View style={[styles.screen, { backgroundColor: tokens.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {permission?.granted ? (
        <>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.overlay, { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 16 }]}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Close scanner"
                accessibilityRole="button"
                onPress={closeScanner}
                style={[
                  styles.closeButton,
                  { backgroundColor: "rgba(15, 23, 42, 0.72)", borderColor: "rgba(255, 255, 255, 0.2)" },
                ]}
              >
                <Ionicons color="#FFFFFF" name="close" size={20} />
              </Pressable>
            </View>

            <View style={styles.centerContent}>
              <View style={styles.targetFrame} />
              <View style={styles.copyBlock}>
                <Text
                  text="Scan the employer QR code"
                  size="sm"
                  weight="bold"
                  style={styles.lightText}
                />
                <Text
                  text="Use a QR code that contains only the 6-digit invite code."
                  size="xs"
                  style={styles.subtleLightText}
                />
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={[styles.permissionState, { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }]}>
          <Pressable
            accessibilityLabel="Close scanner"
            accessibilityRole="button"
            onPress={closeScanner}
            style={[
              styles.closeButton,
              styles.permissionCloseButton,
              { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
            ]}
          >
            <Ionicons color={tokens.textPrimary} name="close" size={20} />
          </Pressable>
          <View style={styles.permissionCopy}>
            <Text text="Camera access needed" size="lg" weight="bold" style={{ color: tokens.textPrimary }} />
            <Text
              text="Allow camera access to scan a 6-digit employer invite QR code."
              size="xs"
              style={{ color: tokens.textSecondary, textAlign: "center" }}
            />
          </View>
          <AppButton label="Allow camera" onPress={() => void requestPermission()} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  centerContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  closeButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  copyBlock: {
    alignItems: "center",
    gap: 6,
    marginTop: 22,
    maxWidth: 280,
  },
  lightText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  permissionCloseButton: {
    alignSelf: "flex-start",
  },
  permissionCopy: {
    alignItems: "center",
    gap: 8,
    maxWidth: 280,
  },
  permissionState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  screen: {
    flex: 1,
  },
  subtleLightText: {
    color: "rgba(255, 255, 255, 0.82)",
    textAlign: "center",
  },
  targetFrame: {
    borderColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 28,
    borderWidth: 2,
    height: 240,
    width: 240,
  },
  topBar: {
    alignItems: "flex-start",
  },
})
