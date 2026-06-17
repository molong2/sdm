import { useState, useRef, useEffect, type FormEvent } from 'react';
import { INTRANET_PASSWORD, AGENT_CALLSIGN } from '../data/config';
import { findAccount } from '../data/accounts';
import type { AgentAccount } from '../data/accounts';

// ─ 최초 로그인 (플레이어 전용 비밀번호만) ────────────────────────
interface InitialLoginProps {
  mode: 'initial';
  onSuccess: (account: AgentAccount) => void;
}

// ─ 로그아웃 후 재로그인 (아이디 + 비밀번호) ──────────────────────
interface SwitchLoginProps {
  mode: 'switch';
  onSuccess: (account: AgentAccount) => void;
}

type Props = InitialLoginProps | SwitchLoginProps;

export function LoginScreen({ mode, onSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  function triggerError(msg: string) {
    setError(msg);
    setPassword('');
    setShake(true);
    setTimeout(() => setShake(false), 500);
    firstRef.current?.focus();
  }

  function attempt(e: FormEvent) {
    e.preventDefault();

    if (mode === 'initial') {
      if (password === INTRANET_PASSWORD) {
        // 플레이어 계정으로 로그인
        const acc = findAccount('A-2019-0047', INTRANET_PASSWORD)!;
        onSuccess(acc);
      } else {
        triggerError('비밀번호가 일치하지 않습니다. 다시 시도하십시오.');
      }
      return;
    }

    // switch 모드: 아이디 + 비밀번호 검증
    const acc = findAccount(username.trim(), password);
    if (acc) {
      onSuccess(acc);
    } else {
      triggerError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* 기관 로고 */}
        <div className="login-emblem">
          <div className="login-emblem__circle">
            <img src="/logo.png" alt="로고" className="login-logo-img" />
          </div>
          <div className="login-emblem__text">
            <div className="login-emblem__name">초자연재난관리국</div>
            <div className="login-emblem__sub">SUPERNATURAL DISASTER MANAGEMENT BUREAU</div>
          </div>
        </div>

        <div className="login-divider" />

        {/* 인사말 or 안내 */}
        <div className="login-greeting">
          {mode === 'initial' ? (
            <>
              <div className="login-greeting__welcome">
                환영합니다, {AGENT_CALLSIGN} 요원.
              </div>
              <div className="login-greeting__sub">
                내부 업무망 접속을 위해 비밀번호를 입력하십시오.
              </div>
            </>
          ) : (
            <>
              <div className="login-greeting__welcome" style={{ fontSize: 15 }}>
                내부망 계정으로 접속
              </div>
              <div className="login-greeting__sub">
                사번 및 비밀번호를 입력하십시오.
              </div>
            </>
          )}
        </div>

        {/* 폼 */}
        <form className="login-form" onSubmit={attempt}>
          {mode === 'switch' && (
            <>
              <label className="login-form__label" htmlFor="login-user">사번 (아이디)</label>
              <input
                id="login-user"
                ref={firstRef}
                type="text"
                className="login-form__input login-form__input--text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="예: A-2019-0047"
                autoComplete="off"
                spellCheck={false}
              />
            </>
          )}

          <label className="login-form__label" htmlFor="login-pw">
            {mode === 'initial' ? '접속 비밀번호' : '비밀번호'}
          </label>
          <input
            id="login-pw"
            ref={mode === 'initial' ? firstRef : undefined}
            type="password"
            className={`login-form__input${shake ? ' login-form__input--shake' : ''}`}
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="비밀번호 입력"
            autoComplete="off"
            spellCheck={false}
          />

          {error && <div className="login-form__error">{error}</div>}

          <button type="submit" className="login-form__btn">
            접 속
          </button>
        </form>

        <div className="login-footer">
          <span className="login-footer__warn">⚠</span>
          본 시스템은 인가된 요원 전용입니다. 무단 접속 시 관련 규정에 따라 처벌받을 수 있습니다.
        </div>
      </div>

      <div className="login-bottom">
        <span>대한민국 행정안전부 산하 | 초자연재난관리국</span>
        <span className="login-bottom__sep">|</span>
        <span>내부 업무망 v2.4.1</span>
        <span className="login-bottom__sep">|</span>
        <span>보안등급: 2급</span>
      </div>
    </div>
  );
}
