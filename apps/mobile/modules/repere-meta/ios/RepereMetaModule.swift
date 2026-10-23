// Le Repère Permis — optional Meta DAT native bridge.
// Requires the public MWDATCore + MWDATCamera SPM products in the native iOS build.
// Expo autolinks this local module; the Podfile attaches the official Meta SwiftPM products.
import Foundation
import AVFoundation
import CoreMedia
import ExpoModulesCore
import MWDATCore
import MWDATCamera
import UIKit

// The optional private-live transport uses short independent objects.
private struct RepereTransportBuffer: @unchecked Sendable { let sample: CMSampleBuffer }

// Serial writer: the camera sends compressed HEVC sample buffers; never transcode via JS/base64.
// A new independent MP4 is created at a keyframe after each target interval.
final class RepereHEVCSegmentWriter: @unchecked Sendable {
  struct Piece {
    let url: URL
    let index: Int
    let bytes: Int64
    let startOffsetMs: Int
    let durationMs: Int
    func payload() -> [String: Any] {
      ["uri": url.absoluteString, "index": index, "bytes": bytes,
       "startOffsetMs": startOffsetMs, "durationMs": durationMs]
    }
  }
  private let queue = DispatchQueue(label: "fr.lerepere.meta.hevc", qos: .userInitiated)
  private var writer: AVAssetWriter?
  private var input: AVAssetWriterInput?
  private var currentURL: URL?
  private var firstPTS: CMTime?
  private var lastDTS: CMTime?
  private var firstDate: Date?
  private var overallStart: Date?
  private var index: Int = 0
  private var closed = false
  private var lastSavedEndMs: Int = 0
  private let directory: URL
  private let seconds: TimeInterval
  private let finished: ([String: Any]) -> Void

  init(directory: URL, seconds: Int, finished: @escaping ([String: Any]) -> Void) {
    self.directory = directory
    self.seconds = TimeInterval(max(10, min(60, seconds)))
    self.finished = finished
    // Reuse the folder after a crash without replacing older video files.
    // A sidecar JSON file is written ONLY when its MP4 has fully closed.
    if let files = try? FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil) {
      let recovered = files.filter { $0.lastPathComponent.hasPrefix("segment-") && $0.pathExtension == "json" }
      for file in recovered {
        guard let data = try? Data(contentsOf: file),
              let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let n = payload["index"] as? Int else { continue }
        index = max(index, n + 1)
        let begin = payload["startOffsetMs"] as? Int ?? 0
        let length = payload["durationMs"] as? Int ?? 0
        lastSavedEndMs = max(lastSavedEndMs, begin + length)
      }
    }
  }

  private func isKeyframe(_ sample: CMSampleBuffer) -> Bool {
    guard let data = CMSampleBufferGetDataBuffer(sample) else { return false }
    let count = CMBlockBufferGetDataLength(data)
    var cursor = 0
    while cursor + 5 <= count {
      var big: UInt32 = 0
      guard CMBlockBufferCopyDataBytes(data, atOffset: cursor, dataLength: 4, destination: &big) == kCMBlockBufferNoErr else { return false }
      let n = Int(UInt32(bigEndian: big)); cursor += 4
      if n < 1 || cursor + n > count { return false }
      var byte: UInt8 = 0
      guard CMBlockBufferCopyDataBytes(data, atOffset: cursor, dataLength: 1, destination: &byte) == kCMBlockBufferNoErr else { return false }
      let kind = (byte >> 1) & 0x3F
      if kind >= 16 && kind <= 21 { return true }
      cursor += n
    }
    return false
  }

  private func start(_ sample: CMSampleBuffer, at date: Date) throws {
    guard let format = CMSampleBufferGetFormatDescription(sample) else { return }
    let url = directory.appendingPathComponent(String(format: "segment-%05d.mp4", index))
    let w = try AVAssetWriter(outputURL: url, fileType: .mp4)
    let track = AVAssetWriterInput(mediaType: .video, outputSettings: nil, sourceFormatHint: format)
    track.expectsMediaDataInRealTime = true
    guard w.canAdd(track) else { throw NSError(domain: "RepereMeta", code: 1) }
    w.add(track)
    guard w.startWriting() else { throw w.error ?? NSError(domain: "RepereMeta", code: 2) }
    w.startSession(atSourceTime: .zero)
    writer = w; input = track; currentURL = url
    firstPTS = nil; lastDTS = nil; firstDate = date
    if overallStart == nil { overallStart = date }
  }

  private func finalize(completion: @escaping (Piece?) -> Void) {
    guard let w=writer, let track=input, let url=currentURL else { completion(nil); return }
    writer=nil;input=nil;currentURL=nil
    track.markAsFinished()
    let n=index
    let begin=firstDate ?? Date()
    let offset=lastSavedEndMs + max(0,Int(begin.timeIntervalSince(overallStart ?? begin)*1000))
    let elapsed=max(250,Int(Date().timeIntervalSince(begin)*1000))
    index+=1
    w.finishWriting {
      guard w.status == .completed,
        let attrs=try? FileManager.default.attributesOfItem(atPath:url.path),
        let bytes=(attrs[.size] as? NSNumber)?.int64Value, bytes>0
      else { completion(nil);return }
      let piece = Piece(url:url,index:n,bytes:bytes,startOffsetMs:offset,durationMs:min(120000,elapsed))
      // Persist before notifying JS, so app suspension cannot lose the segment index.
      let sidecar = url.deletingPathExtension().appendingPathExtension("json")
      if let data = try? JSONSerialization.data(withJSONObject: piece.payload(), options: [.sortedKeys]) {
        try? data.write(to: sidecar, options: .atomic)
      }
      completion(piece)
    }
  }

  func push(_ sample: CMSampleBuffer) {
    let retained = RepereTransportBuffer(sample: sample)
    queue.async { [self] in
      let sample = retained.sample
      guard !closed else { return }
      let now=Date()
      let key=isKeyframe(sample)
      if let start=firstDate, now.timeIntervalSince(start)>=seconds, key {
        finalize { [weak self] piece in
          if let piece { self?.finished(piece.payload()) }
        }
      }
      if writer == nil {
        // Begin an independently playable segment ONLY on a sync frame.
        guard key else { return }
        do { try start(sample,at:now) } catch { return }
      }
      guard let track=input,let w=writer,track.isReadyForMoreMediaData,w.status == .writing else{return}
      let sourcePTS=CMSampleBufferGetPresentationTimeStamp(sample)
      let sourceDTS=CMSampleBufferGetDecodeTimeStamp(sample)
      let origin=firstPTS ?? sourcePTS
      if firstPTS == nil { firstPTS=sourcePTS }
      let sourceDuration = CMSampleBufferGetDuration(sample)
      let frame = sourceDuration.isValid && sourceDuration > .zero
        ? sourceDuration : CMTime(value: 1, timescale: 24)
      var dts=(sourceDTS.isValid ? sourceDTS : sourcePTS)-origin
      if let last=lastDTS, dts<=last { dts=last+frame }
      var pts=sourcePTS-origin
      if pts<dts { pts=dts }
      var timing=CMSampleTimingInfo(duration:frame,presentationTimeStamp:pts,decodeTimeStamp:dts)
      var adjusted:CMSampleBuffer?
      guard CMSampleBufferCreateCopyWithNewTiming(allocator:kCFAllocatorDefault,sampleBuffer:sample,
        sampleTimingEntryCount:1,sampleTimingArray:&timing,sampleBufferOut:&adjusted)==noErr,
        let adjusted else{return}
      // Proper HEVC keyframe attachment is essential for seeking each fragment.
      if let flags = CMSampleBufferGetSampleAttachmentsArray(adjusted, createIfNecessary: true) as? [NSMutableDictionary],
         let dict = flags.first {
        dict[kCMSampleAttachmentKey_NotSync] = !key
        dict[kCMSampleAttachmentKey_DependsOnOthers] = !key
      }
      // The passthrough track preserves the camera's original HEVC bitstream.
      if track.append(adjusted) { lastDTS=dts }
    }
  }

  func finish() async -> [String: Any]? {
    await withCheckedContinuation { (continuation:CheckedContinuation<[String:Any]?,Never>) in
      queue.async { [self] in
        closed=true
        finalize { segment in continuation.resume(returning:segment?.payload()) }
      }
    }
  }
}

// Recover finalized segments even if the JS listener was suspended or the app restarted.
private func recoverRepereSegments(directory: URL) -> [[String: Any]] {
  guard directory.isFileURL,
        let files = try? FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil) else { return [] }
  return files.filter { $0.lastPathComponent.hasPrefix("segment-") && $0.pathExtension == "json" }
    .compactMap { jsonURL -> [String: Any]? in
      guard let raw = try? Data(contentsOf: jsonURL),
            let p = try? JSONSerialization.jsonObject(with: raw) as? [String: Any],
            let uri = p["uri"] as? String, let fileURL = URL(string: uri), fileURL.isFileURL,
            let stats = try? FileManager.default.attributesOfItem(atPath: fileURL.path),
            let size = stats[.size] as? NSNumber,
            size.int64Value > 0 && size.int64Value == (p["bytes"] as? NSNumber)?.int64Value
      else { return nil }
      return p
    }
    .sorted { ($0["index"] as? Int ?? 0) < ($1["index"] as? Int ?? 0) }
}

public final class RepereMetaModule: Module {
  private var session: DeviceSession?
  private var camera: MWDATCamera.Camera?
  private var writer: RepereHEVCContinuousWriter?
  private var liveWriter: RepereHEVCSegmentWriter?
  private var instantPublisher: RepereInstantPublisher?
  private let listeners=ListenerTokenBag()
  private var backgroundObserver: NSObjectProtocol?
  private var captureFinishing = false
  private var activeDirectory: URL?
  private var phone: ReperePhoneCapture?
  private var captureSource = "meta"
  private var frameWidth = 0
  private var frameHeight = 0
  private var frameCount = 0
  private var lastFrameAt: Date?
  private var deviceSelector: AutoDeviceSelector?
  private var connectionTask: Task<Void, Error>?

  private func observeFrame(_ sample: CMSampleBuffer) {
    if let format=CMSampleBufferGetFormatDescription(sample) {
      let size=CMVideoFormatDescriptionGetDimensions(format)
      frameWidth=Int(size.width);frameHeight=Int(size.height)
    }
  }

  private func connectionError(_ message: String) -> NSError {
    NSError(domain: "RepereMeta", code: 30, userInfo: [NSLocalizedDescriptionKey: message])
  }

  // All callers share one attempt. A second tap must not stop the first session.
  @MainActor
  private func connectDevice() async throws {
    if let connectionTask { return try await connectionTask.value }
    let task = Task { @MainActor in
      guard Wearables.shared.registrationState == .registered else {
        throw self.connectionError("Association Meta non terminée. Touchez Associer les lunettes et validez dans Meta AI avant de connecter.")
      }
      if let existing = self.session, existing.state == .started { return }
      if let existing = self.session, existing.state == .paused {
        // Meta owns pause/resume; do not create a competing session.
        try await self.waitForSession(existing, start: false)
        return
      }
      if let existing = self.session, existing.state != .stopped {
        throw self.connectionError("Une session Meta se termine encore. Attendez quelques secondes avant de reconnecter.")
      }
      self.session = nil
      let selector = self.deviceSelector ?? AutoDeviceSelector(wearables: Wearables.shared)
      self.deviceSelector = selector
      self.sendEvent("onState", ["state": "connecting", "message": "Recherche des lunettes disponibles…"])
      // Discovery and the BLE/version handshake finish asynchronously after Meta AI returns.
      try await withThrowingTaskGroup(of: Void.self) { group in
        group.addTask {
          for await device in selector.activeDeviceStream() {
            try Task.checkCancellation()
            if device != nil { return }
          }
          throw CancellationError()
        }
        group.addTask {
          try await Task.sleep(nanoseconds: 20_000_000_000)
          throw self.connectionError("Les lunettes ne sont pas disponibles après 20 secondes. Vérifiez leur connexion dans Meta AI et l’autorisation Bluetooth de cette app, puis réessayez.")
        }
        defer { group.cancelAll() }
        try await group.next()
      }
      try Task.checkCancellation()
      let current = try Wearables.shared.createSession(deviceSelector: selector)
      self.session = current
      do {
        try await self.waitForSession(current, start: true)
      } catch {
        current.stop()
        // Keep the reference until Meta reports stopped; never overlap sessions.
        throw error
      }
    }
    self.connectionTask = task
    defer { self.connectionTask = nil }
    do {
      try await task.value
      self.sendEvent("onState", ["state": "connected"])
    } catch {
      self.sendEvent("onState", ["state": "error", "message": error.localizedDescription])
      throw error
    }
  }

  private func waitForSession(_ current: DeviceSession, start: Bool) async throws {
    // Subscribe before start(), including to one-shot errors, so no transition is lost.
    let states = current.stateStream()
    let errors = current.errorStream()
    try await withThrowingTaskGroup(of: Void.self) { group in
      group.addTask {
        if current.state == .started { return }
        for await state in states {
          try Task.checkCancellation()
          if state == .started { return }
          if state == .stopped {
            throw self.connectionError("La connexion Meta s’est arrêtée. Vérifiez les lunettes dans Meta AI puis réessayez.")
          }
        }
        throw CancellationError()
      }
      group.addTask {
        for await error in errors { throw error }
        throw CancellationError()
      }
      group.addTask {
        try await Task.sleep(nanoseconds: 15_000_000_000)
        throw self.connectionError("Meta n’a pas terminé la connexion après 15 secondes. Vous pouvez réessayer ; vérifiez aussi les mises à jour de Meta AI et des lunettes.")
      }
      defer { group.cancelAll() }
      if start { try current.start() }
      try await group.next()
    }
  }

  // Always close the last MP4, including after a disconnect or background transition.
  private func closeCapture(reason: String? = nil) async -> [String: Any]? {
    guard !captureFinishing else { return nil }
    captureFinishing = true
    let previousWriter = writer
    let previousLiveWriter = liveWriter
    writer = nil
    liveWriter = nil
    activeDirectory = nil
    let previousPhone = phone
    phone = nil
    await previousPhone?.stop()
    camera?.stop()
    camera = nil
    listeners.clear()
    if let instantPublisher { await instantPublisher.stop() }; instantPublisher=nil
    let lastLive = await previousLiveWriter?.finish()
    if let lastLive { sendEvent("onSegment", lastLive) }
    let last = await previousWriter?.finish()
    if let last { sendEvent("onRecordingSaved", last) }
    captureFinishing = false
    if let reason { sendEvent("onError", ["message": reason]) }
    sendEvent("onState", ["state": reason == nil ? "connected" : "error", "message": reason ?? ""])
    return last
  }

  public func definition() -> ModuleDefinition {
    Name("RepereMeta")
    View(ReperePhonePreview.self) {}
    Events("onState","onSegment","onRecordingSaved","onError","onRealtimeState")
    OnCreate {
      do {
        try Wearables.configure()
        self.deviceSelector = AutoDeviceSelector(wearables: Wearables.shared)
      }
      catch { self.sendEvent("onError",["message":error.localizedDescription]) }
      self.backgroundObserver=NotificationCenter.default.addObserver(forName:UIApplication.didEnterBackgroundNotification,
        object:nil,queue:.main) { [weak self] _ in
        // DAT sample ends preview on background; never claim uninterrupted capture.
        // SDK hvc1 may keep streaming while locked. Do not force-stop a long
        // recording merely because the user turns off the iPhone screen.
        // iOS may still suspend it: listen for .stopped and finalize the MOV.
        // No illegal/indefinite background tasks are used.
        if self?.phone != nil {
          Task { [weak self] in
            _ = await self?.closeCapture(reason: "Capture iPhone arrêtée en arrière-plan. La vidéo est conservée sur cet iPhone.")
          }
          return
        }
        if self?.writer != nil {
          self?.sendEvent("onState", ["state":"recording",
            "message":"Écran verrouillé : continuité du flux HEVC dépendante d’iOS et des lunettes."])
        }
      }
    }
    OnDestroy {
      self.connectionTask?.cancel()
      if let phone = self.phone { Task { await phone.stop() } }
      if let observer=self.backgroundObserver { NotificationCenter.default.removeObserver(observer) }
      self.camera?.stop();self.session?.stop();self.listeners.clear()
    }
    AsyncFunction("register") { () async throws -> Void in
      if Wearables.shared.registrationState == .registered {
        self.sendEvent("onState", ["state":"idle", "message":"Lunettes déjà associées. Touchez Connecter les lunettes."])
        return
      }
      try await Wearables.shared.startRegistration()
    }
    AsyncFunction("handleUrl") { (text:String) async throws -> Void in
      guard let url=URL(string:text),URLComponents(url:url,resolvingAgainstBaseURL:false)?
        .queryItems?.contains(where:{$0.name=="metaWearablesAction"})==true else{return}
      _ = try await Wearables.shared.handleUrl(url)
    }
    AsyncFunction("authorizeCamera") { () async throws -> Void in
      if try await Wearables.shared.checkPermissionStatus(.camera) != .granted {
        guard try await Wearables.shared.requestPermission(.camera) == .granted else {
          throw NSError(domain:"RepereMeta",code:8,userInfo:[NSLocalizedDescriptionKey:"Accès caméra Meta refusé."])
        }
      }
    }
    AsyncFunction("connect") { () async throws -> Void in
      try await self.connectDevice()
    }
    AsyncFunction("startRealtime") { (url:String, token:String) async throws -> Void in
      guard self.instantPublisher == nil else { throw NSError(domain:"RepereInstant",code:4,
        userInfo:[NSLocalizedDescriptionKey:"Un direct WebRTC est déjà actif."]) }
      let publisher=await MainActor.run { RepereInstantPublisher() }
      try await publisher.start(serverUrl:url,token:token)
      self.instantPublisher=publisher
      self.sendEvent("onRealtimeState",["state":"publishing","message":"Connecté au serveur WebRTC."])
    }
    AsyncFunction("stopRealtime") { () async -> Void in
      if let publisher=self.instantPublisher {await publisher.stop()}
      self.instantPublisher=nil
      self.sendEvent("onRealtimeState",["state":"stopped"])
    }
    AsyncFunction("realtimeStatus") { () async -> [String:Any] in
      await MainActor.run { ["publishing":self.instantPublisher?.isActive ?? false,
          "published":self.instantPublisher?.isPublished ?? false,
          "framesRecent":self.instantPublisher?.framesRecent ?? false,
          "message":self.instantPublisher?.publishError ?? ""] }
    }
    AsyncFunction("startCapture") { (directory:String, liveEnabled:Bool) async throws -> Void in
      guard self.writer == nil, self.phone == nil else {
        throw self.connectionError("Une capture est déjà active.")
      }
      guard let current=self.session,current.state == .started else {
        throw NSError(domain:"RepereMeta",code:4,userInfo:[NSLocalizedDescriptionKey:"Connectez d'abord les lunettes."])
      }
      let permission=try await Wearables.shared.checkPermissionStatus(.camera)
      guard permission == .granted else {
        throw NSError(domain:"RepereMeta",code:5,userInfo:[NSLocalizedDescriptionKey:
          "Autorisez la caméra dans Meta AI, puis recommencez depuis l'iPhone."])
      }
      guard let target=URL(string:directory),target.isFileURL else {throw NSError(domain:"RepereMeta",code:6)}
      try FileManager.default.createDirectory(at:target,withIntermediateDirectories:true)
      // The master recording is ALWAYS one full-length .mov file on the iPhone.
      let writer = RepereHEVCContinuousWriter(directory: target)
      // Optional short transport files exist ONLY when broadcasting a remote live.
      let liveWriter = liveEnabled ? RepereHEVCSegmentWriter(directory: target, seconds: 12) { [weak self] piece in
        self?.sendEvent("onSegment", piece)
      } : nil
      let config=StreamConfiguration(videoCodec:.hvc1,resolution:.high,frameRate:24)
      guard let camera=try current.addCamera(config:config) else {
        throw NSError(domain:"RepereMeta",code:7,userInfo:[NSLocalizedDescriptionKey:"Caméra Meta indisponible."])
      }
      self.camera=camera;self.writer=writer;self.liveWriter=liveWriter;self.activeDirectory=target
      self.captureSource="meta";self.frameCount=0;self.lastFrameAt=nil;self.frameWidth=0;self.frameHeight=0
      camera.stream.videoFramePublisher.listen { frame in
        writer.push(frame.sampleBuffer)
        liveWriter?.push(frame.sampleBuffer)
        let safe=RepereTransportBuffer(sample:frame.sampleBuffer)
        Task { @MainActor [weak self] in
          self?.observeFrame(safe.sample)
          self?.frameCount += 1; self?.lastFrameAt=Date()
          self?.instantPublisher?.push(safe.sample)
        }
      }.store(in:self.listeners)
      camera.stream.errorPublisher.listen { [weak self] error in
        self?.sendEvent("onError",["message":error.localizedDescription])
      }.store(in:self.listeners)
      camera.stream.statePublisher.listen { [weak self] state in
        if state == .streaming { self?.sendEvent("onState",["state":"recording"]) }
        if state == .stopped {
          Task { @MainActor [weak self] in
            guard let self, self.writer != nil else { return }
            _ = await self.closeCapture(reason: "Flux Meta interrompu. Le fichier vidéo complet est en cours de finalisation sur l’iPhone.")
          }
        }
      }.store(in:self.listeners)
      self.sendEvent("onState",["state":"connecting","message":"Démarrage du flux caméra..."])
      camera.stream.start()
    }
    AsyncFunction("stopCapture") { () async -> [String:Any]? in
      await self.closeCapture()
    }
    AsyncFunction("startPhoneCapture") { (directory:String) async throws -> Void in
      guard self.writer == nil, self.camera == nil, self.phone == nil, !self.captureFinishing else {
        throw self.connectionError("Une capture est déjà active.")
      }
      guard let target=URL(string:directory), target.isFileURL else {
        throw self.connectionError("Dossier vidéo inaccessible.")
      }
      try FileManager.default.createDirectory(at:target,withIntermediateDirectories:true)
      let writer=RepereHEVCContinuousWriter(directory:target)
      self.writer=writer;self.activeDirectory=target;self.captureSource="iphone"
      self.frameCount=0;self.lastFrameAt=nil;self.frameWidth=0;self.frameHeight=0
      let phone=ReperePhoneCapture { [weak self] sample in
        writer.push(sample)
        let safe=RepereTransportBuffer(sample:sample)
        Task { @MainActor [weak self] in
          guard let self, self.phone != nil else { return }
          self.observeFrame(safe.sample)
          self.frameCount += 1;self.lastFrameAt=Date()
          if self.frameCount == 1 { self.sendEvent("onState",["state":"recording","message":"Caméra iPhone active."]) }
          self.instantPublisher?.push(safe.sample)
        }
      }
      self.phone=phone
      self.sendEvent("onState",["state":"connecting","message":"Ouverture de la caméra iPhone…"])
      do { try await phone.start() }
      catch { _ = await self.closeCapture(reason:error.localizedDescription);throw error }
    }
    AsyncFunction("deviceStatus") { () async -> [String:Any] in
      await MainActor.run {
        ["registered":Wearables.shared.registrationState == .registered,
         "available":self.deviceSelector?.activeDevice != nil,
         "connected":self.session?.state == .started,
         "phoneCameraPermission":AVCaptureDevice.authorizationStatus(for:.video).rawValue,
         "source":self.captureSource,"frames":self.frameCount,
         "width":self.frameWidth,"height":self.frameHeight,
         "framesRecent":self.lastFrameAt.map { Date().timeIntervalSince($0)<5 } ?? false]
      }
    }
    AsyncFunction("recoverRecordings") { (directory: String) async throws -> [[String: Any]] in
      guard let url = URL(string: directory), url.isFileURL else {
        throw NSError(domain: "RepereMeta", code: 22, userInfo: [NSLocalizedDescriptionKey: "Dossier vidéo inaccessible."])
      }
      return recoverRepereRecordings(directory: url)
    }
    AsyncFunction("recoverSegments") { (directory: String) async throws -> [[String: Any]] in
      guard let url = URL(string: directory), url.isFileURL else {
        throw NSError(domain: "RepereMeta", code: 9, userInfo: [NSLocalizedDescriptionKey: "Dossier vidéo inaccessible."])
      }
      return recoverRepereSegments(directory: url)
    }
    AsyncFunction("captureStatus") { () -> [String: Any] in
      ["active": self.writer != nil && (self.camera != nil || self.phone != nil) && !self.captureFinishing,
       "directory": self.activeDirectory?.absoluteString ?? ""]
    }
    AsyncFunction("disconnect") { () async -> Void in
      let pending = await MainActor.run {
        self.connectionTask?.cancel()
        return self.connectionTask
      }
      _ = try? await pending?.value
      _ = await self.closeCapture()
      self.session?.stop()
      self.session=nil;self.listeners.clear()
      self.sendEvent("onState",["state":"idle"])
    }
  }
}
