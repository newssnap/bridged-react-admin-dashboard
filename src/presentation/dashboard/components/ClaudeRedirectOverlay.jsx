import { useEffect, useMemo } from 'react';
import { Spin, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

const CONFETTI_COLORS = ['#722ed1', '#52c41a', '#1677ff', '#faad14', '#eb2f96', '#13c2c2', '#f5222d'];

function createConfettiPieces(count = 48) {
  return Array.from({ length: count }, (_, index) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.35;
    const duration = 1.8 + Math.random() * 1.4;
    const size = 6 + Math.random() * 8;
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const rotate = Math.random() * 360;
    const drift = (Math.random() - 0.5) * 120;

    return { id: index, left, delay, duration, size, color, rotate, drift };
  });
}

function ClaudeRedirectOverlay({ open }) {
  const confettiPieces = useMemo(() => (open ? createConfettiPieces() : []), [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const styleId = 'claude-party-popper-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes claude-confetti-fall {
          0% {
            opacity: 1;
            transform: translate3d(0, -12vh, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--claude-drift), 110vh, 0) rotate(720deg);
          }
        }
        @keyframes claude-popper-burst {
          0% { transform: scale(0.6); opacity: 0; }
          40% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    return undefined;
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(2px)',
        overflow: 'hidden',
      }}
    >
      {confettiPieces.map(piece => (
        <span
          key={piece.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.45,
            borderRadius: 2,
            backgroundColor: piece.color,
            '--claude-drift': `${piece.drift}px`,
            transform: `rotate(${piece.rotate}deg)`,
            animation: `claude-confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '36px 40px',
          maxWidth: 420,
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18)',
          position: 'relative',
          zIndex: 1,
          animation: 'claude-popper-burst 0.45s ease-out',
        }}
      >
        <CheckCircleFilled
          style={{
            fontSize: 40,
            color: '#52c41a',
            marginBottom: 16,
          }}
        />
        <Title level={3} style={{ marginBottom: 8, fontWeight: 500 }}>
          Authentication done
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 40, fontSize: 15 }}>
          Redirecting you back to Claude…
        </Text>
        <div style={{ marginTop: 8 }}>
          <Spin size="large" />
        </div>
      </div>
    </div>
  );
}

export default ClaudeRedirectOverlay;
