// Meta DAT hvc1 -> VideoToolbox decoder -> LiveKit BufferCapturer -> WebRTC SFU.
// IMPORTANT: this is the Meta CAMERA, not the iPhone front/rear camera.
// The original compressed HEVC samples are simultaneously saved by the existing
// RepereHEVCContinuousWriter as ONE MOV per lesson. No server recording by default.
import Foundation
import CoreMedia
import CoreVideo
import VideoToolbox
import LiveKit

private struct SendableMetaFrame: @unchecked Sendable { let sample: CMSampleBuffer }
private struct SendableVideoPixel: @unchecked Sendable { let pixel: CVPixelBuffer }

/// A streaming HEVC decoder, instantiated only for a WebRTC broadcast.
/// Metal/VideoToolbox does the decompression, not JavaScript/base64.
private final class ReperePixelDecoder: @unchecked Sendable {
  private var session: VTDecompressionSession?
  private var format: CMFormatDescription?
  private let output: @Sendable (CVPixelBuffer) -> Void
  init(output: @escaping @Sendable (CVPixelBuffer) -> Void) { self.output=output }
  func push(_ sample: CMSampleBuffer) {
    if let pixel = CMSampleBufferGetImageBuffer(sample) { output(pixel); return }
    guard let description=CMSampleBufferGetFormatDescription(sample) else { return }
    if format == nil || !CMFormatDescriptionEqual(format!,otherFormatDescription:description) {
      if let old=session { VTDecompressionSessionInvalidate(old) }
      session=nil;format=description
      var created:VTDecompressionSession?
      let attrs:[String:Any] = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange]
      guard VTDecompressionSessionCreate(allocator:kCFAllocatorDefault,formatDescription:description,
        decoderSpecification:nil,imageBufferAttributes:attrs as CFDictionary,
        outputCallback:nil,decompressionSessionOut:&created)==noErr else { return }
      session=created
    }
    guard let decoder=session else { return }
    var info:VTDecodeInfoFlags=[]
    let output=output
    _=VTDecompressionSessionDecodeFrame(decoder,sampleBuffer:sample,
      flags:[._EnableAsynchronousDecompression],infoFlagsOut:&info) { status,_,pixel,_,_ in
      if status == noErr, let pixel { output(pixel) }
    }
  }
  func close(){ if let session {VTDecompressionSessionWaitForAsynchronousFrames(session);VTDecompressionSessionInvalidate(session)};session=nil;format=nil }
}

@MainActor
final class RepereInstantPublisher {
  private let room=Room()
  private var track:LocalVideoTrack?
  private var capture:BufferCapturer?
  private var decoder:ReperePixelDecoder?
  private let frames=DispatchQueue(label:"fr.lerepere.instant.meta.decode",qos:.userInitiated)
  private var connected=false
  private var connectedAt:Date?
  private var lastDecodedFrameAt:Date?
  private var publishStarted=false
  private var publishSucceeded=false
  private var publishFailed=false
  private(set) var publishError:String?
  var isActive:Bool {connected && !publishFailed}
  var isPublished:Bool {connected && publishSucceeded && !publishFailed}
  var framesRecent:Bool {
    guard connected && !publishFailed else {return false}
    let grace=Date().timeIntervalSince(connectedAt ?? .distantPast)<12
    if let lastDecodedFrameAt {
      return Date().timeIntervalSince(lastDecodedFrameAt)<9 && (publishSucceeded || grace)
    }
    return grace
  }

  func start(serverUrl:String,token:String) async throws {
    guard !connected else { throw NSError(domain:"RepereInstant",code:1,
      userInfo:[NSLocalizedDescriptionKey:"Un direct est déjà actif sur cet iPhone."]) }
    guard serverUrl.hasPrefix("wss://") && !token.isEmpty else {
      throw NSError(domain:"RepereInstant",code:2,userInfo:[NSLocalizedDescriptionKey:"Accès LiveKit invalide."])
    }
    do {
      try await room.connect(url:serverUrl,token:token)
      // BufferCapturer does not open a phone camera. It accepts Meta pixels only.
      let track=await LocalVideoTrack.createBufferTrack(name:"repere-meta",source:.camera,
        options:BufferCaptureOptions(dimensions:Dimensions(width:720,height:1280),fps:24))
      guard let capture=track.capturer as? BufferCapturer else {
        throw NSError(domain:"RepereInstant",code:3,userInfo:[NSLocalizedDescriptionKey:"Capture WebRTC indisponible."])
      }
      // IMPORTANT: LiveKit BufferCapturer requires at least one camera frame
      // BEFORE publish(videoTrack:), otherwise publish times out waiting for dimensions.
      // The camera stream starts later from the existing Expo button.
      self.capture=capture;self.track=track
      connected=true;connectedAt=Date();lastDecodedFrameAt=nil
      publishStarted=false;publishSucceeded=false;publishFailed=false;publishError=nil
      self.decoder=ReperePixelDecoder { [weak self] pixel in
        let frame=SendableVideoPixel(pixel:pixel)
        Task { @MainActor [weak self] in
          guard let self,self.connected else {return}
          self.capture?.capture(frame.pixel)
          self.lastDecodedFrameAt=Date()
          guard !self.publishStarted, let currentTrack=self.track else {return}
          self.publishStarted=true
          Task { @MainActor [weak self] in
            guard let self,self.connected else {return}
            do {
              _=try await self.room.localParticipant.publish(videoTrack:currentTrack,options:VideoPublishOptions(encoding:VideoEncoding(maxBitrate:3_000_000,maxFps:24)))
              self.publishSucceeded=true
            } catch {
              self.publishFailed=true
              self.publishError=error.localizedDescription
            }
          }
        }
      }
    } catch {
      await room.disconnect()
      throw error
    }
  }

  func push(_ frame:CMSampleBuffer) {
    guard connected,let decoder else {return}
    let safe=SendableMetaFrame(sample:frame)
    frames.async { decoder.push(safe.sample) }
  }
  func stop() async {
    connected=false;connectedAt=nil;lastDecodedFrameAt=nil
    publishStarted=false;publishSucceeded=false;publishFailed=false;publishError=nil
    let oldDecoder=decoder
    decoder=nil;capture=nil;track=nil
    if let oldDecoder {frames.sync { oldDecoder.close() }}
    await room.disconnect()
  }
}
