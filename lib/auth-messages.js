const CODE_MESSAGES = {
  email_not_confirmed: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
  email_exists: 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน',
  invalid_credentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  otp_expired: 'ลิงก์นี้หมดอายุหรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่',
  over_email_send_rate_limit: 'ส่งอีเมลบ่อยเกินไป รอสักครู่แล้วลองใหม่',
  over_request_rate_limit: 'ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่',
  same_password: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม',
  session_not_found: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  user_already_exists: 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน',
  validation_failed: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่',
  weak_password: 'รหัสผ่านยังไม่ปลอดภัยพอ กรุณาใช้รหัสผ่านที่เดายากขึ้น',
};

const MESSAGE_PATTERNS = [
  [/invalid login credentials|invalid credentials/i, CODE_MESSAGES.invalid_credentials],
  [/email not confirmed/i, CODE_MESSAGES.email_not_confirmed],
  [/already registered|already exists|user already registered/i, CODE_MESSAGES.user_already_exists],
  [/rate limit|too many requests|email rate limit/i, CODE_MESSAGES.over_request_rate_limit],
  [/expired|token.*invalid|otp.*invalid|already been used/i, CODE_MESSAGES.otp_expired],
  [/same password/i, CODE_MESSAGES.same_password],
  [/session.*(missing|not found|expired)/i, CODE_MESSAGES.session_not_found],
  [/weak password|password.*weak/i, CODE_MESSAGES.weak_password],
];

// Supabase messages can change between GoTrue versions. Prefer stable error
// codes, then a small compatibility map, and never expose an unknown provider
// message directly to the user.
export function authErrorMessage(error, fallback = 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง') {
  const code = typeof error === 'object' && error ? error.code : '';
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  const message =
    typeof error === 'string'
      ? error
      : typeof error?.message === 'string'
        ? error.message
        : '';

  const match = MESSAGE_PATTERNS.find(([pattern]) => pattern.test(message));
  return match ? match[1] : fallback;
}
