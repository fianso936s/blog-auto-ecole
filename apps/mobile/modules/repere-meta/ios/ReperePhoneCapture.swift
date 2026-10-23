import AVFoundation
import ExpoModulesCore
import UIKit

extension Notification.Name {
  static let reperePhonePreview = Notification.Name("fr.lerepere.phone.preview")
}

// One camera pipeline supplies both the local MOV and the private LiveKit track.
// No microphone or audio input is opened.
final class ReperePhoneCapture: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate, @unchecked Sendable {
  let captureSession = AVCaptureSession()
  private let queue = DispatchQueue(label: "fr.lerepere.phone.camera", qos: .userInitiated)
  private let output = AVCaptureVideoDataOutput()
  private let frame: (CMSampleBuffer) -> Void
  init(frame: @escaping (CMSampleBuffer) -> Void) { self.frame = frame }

  func start() async throws {
    let permitted = await AVCaptureDevice.requestAccess(for: .video)
    guard permitted else {
      throw NSError(domain: "ReperePhone", code: 1, userInfo: [NSLocalizedDescriptionKey: "Autorisez la caméra dans Réglages → Le Repère Permis."])
    }
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      queue.async {
        var configuring = false
        do {
          self.captureSession.beginConfiguration()
          configuring = true
          self.captureSession.sessionPreset = .hd1280x720
          guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
            throw NSError(domain: "ReperePhone", code: 2, userInfo: [NSLocalizedDescriptionKey: "Caméra arrière indisponible."])
          }
          let input = try AVCaptureDeviceInput(device: device)
          guard self.captureSession.canAddInput(input), self.captureSession.canAddOutput(self.output) else {
            throw NSError(domain: "ReperePhone", code: 3, userInfo: [NSLocalizedDescriptionKey: "La caméra est utilisée par une autre application."])
          }
          self.captureSession.addInput(input)
          self.output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange]
          self.output.alwaysDiscardsLateVideoFrames = true
          self.output.setSampleBufferDelegate(self, queue: self.queue)
          self.captureSession.addOutput(self.output)
          if let connection = self.output.connection(with: .video), connection.isVideoRotationAngleSupported(90) {
            connection.videoRotationAngle = 90
          }
          self.captureSession.commitConfiguration()
          configuring = false
          self.captureSession.startRunning()
          guard self.captureSession.isRunning else { throw NSError(domain: "ReperePhone", code: 4) }
          DispatchQueue.main.async {
            ReperePhonePreview.currentSession = self.captureSession
            NotificationCenter.default.post(name: .reperePhonePreview, object: self.captureSession)
          }
          continuation.resume()
        } catch {
          if configuring { self.captureSession.commitConfiguration() }
          continuation.resume(throwing: error)
        }
      }
    }
  }
  func stop() async {
    await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
      queue.async {
        self.output.setSampleBufferDelegate(nil, queue: nil)
        if self.captureSession.isRunning { self.captureSession.stopRunning() }
        DispatchQueue.main.async {
          ReperePhonePreview.currentSession = nil
          NotificationCenter.default.post(name: .reperePhonePreview, object: nil)
        }
        continuation.resume()
      }
    }
  }
  func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    frame(sampleBuffer)
  }
}

final class ReperePhonePreview: ExpoView {
  static weak var currentSession: AVCaptureSession?
  private let preview = AVCaptureVideoPreviewLayer()
  private var observer: NSObjectProtocol?
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    preview.videoGravity = .resizeAspectFill
    preview.session = Self.currentSession
    layer.addSublayer(preview)
    observer = NotificationCenter.default.addObserver(forName: .reperePhonePreview, object: nil, queue: .main) { [weak self] note in
      self?.preview.session = note.object as? AVCaptureSession
    }
  }
  override func layoutSubviews() { super.layoutSubviews(); preview.frame = bounds }
  deinit { if let observer { NotificationCenter.default.removeObserver(observer) } }
}
