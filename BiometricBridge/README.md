# Biometric Bridge (DigitalPersona .NET)

This project serves as a local bridge between the DigitalPersona fingerprint hardware and the `SecureAccess` frontend. It bypasses browser-based SSL/CORS restrictions by providing a native .NET interface.

## Setup Instructions

1.  **Reference the DigitalPersona SDK (U.are.U)**:
    This bridge requires the following DLLs from the official HID DigitalPersona UruNet SDK:
    - `DPUruNet.dll` (Core)
    - `DPCtlUruNet.dll` (Control)
    - `DPXUru.dll` (Extension)

    To add these references:
    ```bash
    dotnet add BiometricBridge.csproj reference /path/to/DPUruNet.dll
    ```

2.  **Run the Bridge**:
    ```bash
    dotnet run --project BiometricBridge
    ```
    The bridge will start on `http://localhost:5001`.

## API Endpoints

- `GET /health`: Check if the bridge is running and hardware is detected.
- `GET /capture`: Starts a capture operation and waits for a finger touch. Returns the Base64 template.
- `WS /ws`: WebSocket endpoint for real-time capture events (future improvement).

## Integration with SecureAccess

Update `SecureAccess/src/utils/biometric.js` to point to `http://localhost:5001/capture` instead of the HID Web SDK if the local service is not available.
