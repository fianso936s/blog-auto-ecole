/** LiveKit tokens are minted by our authenticated Neon API, never by the phone. */
import { request } from "./auth";

export type RTCConfig = { enabled:boolean; mode:"webrtc-sfu"; maxStudents:number; message:string };
export type RTCJoin = {url:string;token:string;expiresIn:number;publisher:boolean;roomId:string;maxStudents:number};
export type RTCStatus = { active:boolean; status:"idle"|"live"|"ended"; maxStudents:number };
export const getRTCConfig = () => request<RTCConfig>("/v1/webrtc/config");
export const startRTC = (videoId:string,students:string[]) => request<{ok:boolean;mode:string;maxStudents:number}>(`/v1/videos/${videoId}/webrtc/start`,{method:"POST",body:JSON.stringify({students})});
export const joinRTC = (videoId:string) => request<RTCJoin>(`/v1/videos/${videoId}/webrtc/join`,{method:"POST",body:"{}"});
export const rtcStatus = (videoId:string) => request<RTCStatus>(`/v1/videos/${videoId}/webrtc/status`);
export const rtcHeartbeat = (videoId:string) => request<{ok:boolean}>(`/v1/videos/${videoId}/webrtc/heartbeat`,{method:"POST",body:"{}"});
export const stopRTC = (videoId:string) => request<{ok:boolean}>(`/v1/videos/${videoId}/webrtc/stop`,{method:"POST",body:"{}"});
export const changeRTCAudience = (videoId:string,students:string[]) => request<{ok:boolean;selected:number;pendingKick:number}>(`/v1/videos/${videoId}/webrtc/grants`,{method:"PUT",body:JSON.stringify({students})});
