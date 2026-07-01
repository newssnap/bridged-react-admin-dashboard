import React from 'react';
import { Typography, Row, Col, Popover, Checkbox, theme, Empty } from 'antd';

const { Text } = Typography;

const AgentsPopoverContent = ({ agents }) => (
  <div
    style={{
      minWidth: 220,
      maxWidth: 320,
    }}
  >
    <div
      style={{
        padding: '12px 8px 10px',
        borderBottom: '1px solid var(--primary-Color-Opacity)',
        marginBottom: 8,
      }}
    >
      <Text
        strong
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--secondary-Color)',
        }}
      >
        Playbook Agents
      </Text>
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        maxHeight: 240,
        overflowY: 'auto',
        padding: '0 8px 12px',
      }}
    >
      {agents.map((agent, idx) => (
        <div
          key={idx}
          style={{
            padding: '8px 6px',
            borderRadius: 8,
            backgroundColor: 'var(--primary-Color-Opacity)',
            border: '1px solid var(--primary-Color-Opacity)',
          }}
        >
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>
            {agent.label}
          </Text>
          {agent.description && (
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {agent.description}
            </Text>
          )}
        </div>
      ))}
    </div>
  </div>
);

const PlaybookSelectionList = ({
  playbooks = [],
  playbookAgentLabelMap = {},
  selectedPlaybooks = [],
  onToggle,
  emptyDescription = 'No active playbooks found',
}) => {
  const { token } = theme.useToken();
  const { colorBgContainer, colorBorderSecondary, colorPrimary } = token;

  if (playbooks.length === 0) {
    return <Empty description={emptyDescription} />;
  }

  return (
    <Row gutter={[12, 12]}>
      {playbooks.map(playbook => {
        const IconComp = playbook.icon;
        const isChecked = selectedPlaybooks.includes(playbook.value);
        const playbookAgents = (playbook.agentTypes || []).map(agentType => ({
          value: agentType,
          label: playbookAgentLabelMap[agentType] || agentType,
          description: playbook.agentDescriptions?.[agentType] || '',
        }));

        return (
          <Col key={playbook.value} xs={24} sm={24} md={24} lg={24} xl={24}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onToggle(playbook.value, !isChecked)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle(playbook.value, !isChecked);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 'var(--mpr-2)',
                borderRadius: 'var(--mpr-3)',
                backgroundColor: colorBgContainer,
                border: `1px solid ${isChecked ? colorPrimary : colorBorderSecondary}`,
                boxShadow: isChecked ? `0 0 0 1px ${colorPrimary}33` : undefined,
                cursor: 'pointer',
              }}
            >
              <Checkbox
                checked={isChecked}
                onChange={event => onToggle(playbook.value, event.target.checked)}
                onClick={event => event.stopPropagation()}
              />
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 8,
                  background: `${colorPrimary}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {IconComp ? <IconComp style={{ fontSize: 20, color: colorPrimary }} /> : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 2,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Text strong style={{ fontSize: 15 }} className="singleLine">
                      {playbook.title}
                    </Text>
                  </div>
                  {playbookAgents.length > 0 && (
                    <Popover
                      trigger="hover"
                      placement="top"
                      overlayInnerStyle={{ padding: 0 }}
                      content={<AgentsPopoverContent agents={playbookAgents} />}
                    >
                      <span
                        role="presentation"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: `${colorPrimary}14`,
                          color: colorPrimary,
                          cursor: 'pointer',
                          flexShrink: 0,
                          border: `1px solid ${colorPrimary}30`,
                        }}
                      >
                        {playbookAgents.length} agents
                      </span>
                    </Popover>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }} className="secondLine">
                  {playbook.shortDescription}
                </Text>
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default PlaybookSelectionList;
