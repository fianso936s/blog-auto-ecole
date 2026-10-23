// Le Repère Permis — single-file HEVC recording from Meta DAT camera stream.
// The camera's compressed hvc1 CMSampleBuffer is written directly to ONE .mov.
// No application-level rollover, arbitrary 5-minute limit or transcoding.
import AVFoundation
import CoreMedia
import Foundation

// CMSampleBuffer is retained immutably for the writer's serial dispatch queue.
private struct RepereSendableBuffer: @unchecked Sendable { let sample: CMSampleBuffer }
final class RepereHEVCContinuousWriter: @unchecked Sendable {
  private let queue = DispatchQueue(label: "fr.lerepere.meta.one-recording", qos: .userInitiated)
  private let directory: URL
  private var writer: AVAssetWriter?
  private var input: AVAssetWriterInput?
  private var recordingURL: URL?
  private var originPTS: CMTime?
  private var latestDTS: CMTime?
  private var lastFrameEnd: CMTime = .zero
  private var startedAt: Date?
  private var closed = false
  private let fileID = UUID().uuidString.lowercased()

  init(directory: URL) { self.directory = directory }

  private func isKeyframe(_ buffer: CMSampleBuffer) -> Bool {
    if CMSampleBufferGetImageBuffer(buffer) != nil { return true }
    guard let data = CMSampleBufferGetDataBuffer(buffer) else { return false }
    let length = CMBlockBufferGetDataLength(data)
    var offset = 0
    while offset + 5 <= length {
      var big: UInt32 = 0
      guard CMBlockBufferCopyDataBytes(data, atOffset: offset, dataLength: 4, destination: &big) == kCMBlockBufferNoErr else { return false }
      let n = Int(UInt32(bigEndian: big))
      offset += 4
      if n < 1 || offset + n > length { return false }
      var byte: UInt8 = 0
      guard CMBlockBufferCopyDataBytes(data, atOffset: offset, dataLength: 1, destination: &byte) == kCMBlockBufferNoErr else { return false }
      let nal = (byte >> 1) & 0x3f
      if (16...21).contains(nal) { return true }
      offset += n
    }
    return false
  }

  private func begin(_ buffer: CMSampleBuffer) throws {
    guard let format = CMSampleBufferGetFormatDescription(buffer) else { return }
    let url = directory.appendingPathComponent("recording-\(fileID).mov")
    let newWriter = try AVAssetWriter(outputURL: url, fileType: .mov)
    // Fragmentation INSIDE the one .mov container is a file-integrity feature,
    // not separate user-facing video clips or multiple files. This may improve
    // recovery but cannot guarantee a playable file after an OS-level kill.
    newWriter.movieFragmentInterval = CMTime(seconds: 10, preferredTimescale: 600)
    let dimensions = CMVideoFormatDescriptionGetDimensions(format)
    let settings: [String: Any]? = CMSampleBufferGetImageBuffer(buffer) == nil ? nil : [
      AVVideoCodecKey: AVVideoCodecType.hevc,
      AVVideoWidthKey: Int(dimensions.width), AVVideoHeightKey: Int(dimensions.height)
    ]
    let track = AVAssetWriterInput(mediaType: .video, outputSettings: settings, sourceFormatHint: format)
    track.expectsMediaDataInRealTime = true
    guard newWriter.canAdd(track) else {
      throw NSError(domain: "RepereMeta", code: 20, userInfo: [NSLocalizedDescriptionKey: "Piste vidéo HEVC incompatible."])
    }
    newWriter.add(track)
    guard newWriter.startWriting() else {
      throw newWriter.error ?? NSError(domain: "RepereMeta", code: 21, userInfo: [NSLocalizedDescriptionKey: "Impossible de commencer le fichier MOV."])
    }
    newWriter.startSession(atSourceTime: .zero)
    writer = newWriter
    input = track
    recordingURL = url
    startedAt = Date()
  }

  func push(_ buffer: CMSampleBuffer) {
    let retained = RepereSendableBuffer(sample: buffer)
    queue.async { [self] in
      let buffer = retained.sample
      guard !closed else { return }
      let key = isKeyframe(buffer)
      if writer == nil {
        // A decodable movie must begin on a sync frame, not a predicted frame.
        guard key else { return }
        do { try begin(buffer) } catch { return }
      }
      guard let writer, let input, writer.status == .writing, input.isReadyForMoreMediaData else { return }
      let sourcePTS = CMSampleBufferGetPresentationTimeStamp(buffer)
      let sourceDTS = CMSampleBufferGetDecodeTimeStamp(buffer)
      guard sourcePTS.isValid else { return }
      let origin = originPTS ?? sourcePTS
      if originPTS == nil { originPTS = sourcePTS }
      let duration = CMSampleBufferGetDuration(buffer)
      let frameDuration = (duration.isValid && duration > .zero) ? duration : CMTime(value: 1, timescale: 24)
      var dts = (sourceDTS.isValid ? sourceDTS : sourcePTS) - origin
      if let last = latestDTS, dts <= last { dts = last + frameDuration }
      var pts = sourcePTS - origin
      if pts < dts { pts = dts }
      var timing = CMSampleTimingInfo(duration: frameDuration, presentationTimeStamp: pts, decodeTimeStamp: dts)
      var adjusted: CMSampleBuffer?
      guard CMSampleBufferCreateCopyWithNewTiming(allocator: kCFAllocatorDefault,
        sampleBuffer: buffer, sampleTimingEntryCount: 1, sampleTimingArray: &timing,
        sampleBufferOut: &adjusted) == noErr, let adjusted else { return }
      if let flags = CMSampleBufferGetSampleAttachmentsArray(adjusted, createIfNecessary: true) as? [NSMutableDictionary],
        let first = flags.first {
        first[kCMSampleAttachmentKey_NotSync] = !key
        first[kCMSampleAttachmentKey_DependsOnOthers] = !key
      }
      if input.append(adjusted) {
        latestDTS = dts
        lastFrameEnd = pts + frameDuration
      }
    }
  }

  func finish() async -> [String: Any]? {
    await withCheckedContinuation { (continuation: CheckedContinuation<[String: Any]?, Never>) in
      queue.async { [self] in
        guard !closed else { continuation.resume(returning: nil); return }
        closed = true
        guard let writer, let input, let url = recordingURL, let startedAt else {
          continuation.resume(returning: nil)
          return
        }
        input.markAsFinished()
        let duration = max(1, Int(lastFrameEnd.seconds * 1000))
        writer.finishWriting {
          guard writer.status == .completed,
            let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
            let size = (attrs[.size] as? NSNumber)?.int64Value, size > 0 else {
            continuation.resume(returning: nil)
            return
          }
          let saved: [String: Any] = [
            "uri": url.absoluteString,
            "bytes": size,
            "durationMs": duration,
            "startedAt": ISO8601DateFormatter().string(from: startedAt),
            "format": "video/quicktime",
          ]
          // Persist the recording reference before emitting to JavaScript.
          let sidecar = url.deletingPathExtension().appendingPathExtension("json")
          if let data = try? JSONSerialization.data(withJSONObject: saved, options: [.sortedKeys]) {
            try? data.write(to: sidecar, options: .atomic)
          }
          continuation.resume(returning: saved)
        }
      }
    }
  }
}

// Recover already finalized one-file recordings without depending on JS listeners.
// Unfinished .mov files are not marked playable until they pass AVAssetWriter.finishWriting.
func recoverRepereRecordings(directory: URL) -> [[String: Any]] {
  guard directory.isFileURL,
    let files = try? FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil)
  else { return [] }
  return files.filter { $0.lastPathComponent.hasPrefix("recording-") && $0.pathExtension == "json" }
    .compactMap { sidecar -> [String: Any]? in
      guard let bytes = try? Data(contentsOf: sidecar),
        let info = try? JSONSerialization.jsonObject(with: bytes) as? [String: Any],
        let uri = info["uri"] as? String, let url = URL(string: uri), url.isFileURL,
        url.deletingLastPathComponent().standardizedFileURL.path == directory.standardizedFileURL.path,
        let stats = try? FileManager.default.attributesOfItem(atPath: url.path),
        let size = (stats[.size] as? NSNumber)?.int64Value,
        size > 0, size == (info["bytes"] as? NSNumber)?.int64Value else { return nil }
      return info
    }
    .sorted { ($0["startedAt"] as? String ?? "") < ($1["startedAt"] as? String ?? "") }
}
