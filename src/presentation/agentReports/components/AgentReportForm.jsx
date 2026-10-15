import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  Radio,
  Row,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  AGENT_REPORT_MAX_CAMPAIGNS,
  AGENT_REPORT_TYPES,
  AGENT_REPORT_TYPE_OPTIONS,
} from '../../../constants/agentReportTypes';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const disableFutureDates = current => current && current.isAfter(dayjs(), 'day');

function AgentReportForm({ form, onGenerate, isSubmitting, submitError }) {
  const {
    agentType,
    setAgentType,
    rows,
    addRow,
    canAddRow,
    removeRow,
    updateRow,
    pasteText,
    setPasteText,
    pastedIdCount,
    addPastedIds,
    pasteNotice,
    bulkRange,
    setBulkRange,
    applyBulkRangeToAll,
    rowErrors,
    formError,
  } = form;

  return (
    <Card title="New report">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Agent type */}
        <Space direction="vertical" size={4}>
          <Text strong>Agent type</Text>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            options={AGENT_REPORT_TYPE_OPTIONS}
            value={agentType}
            onChange={e => setAgentType(e.target.value)}
          />
          <Text type="secondary">{AGENT_REPORT_TYPES[agentType]?.description}</Text>
        </Space>

        <Divider style={{ margin: 0 }} />

        {/* Bulk helpers */}
        <Row gutter={[15, 15]}>
          <Col xs={24} lg={12}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text strong>Paste many agent IDs</Text>
              <TextArea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="One ID per line (commas and spaces also work)"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
              <Button onClick={addPastedIds} disabled={!pastedIdCount} icon={<PlusOutlined />}>
                {pastedIdCount ? `Add ${pastedIdCount} ID(s)` : 'Add rows'}
              </Button>
              {pasteNotice && <Text type="secondary">{pasteNotice}</Text>}
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text strong>Same dates for every agent</Text>
              <RangePicker
                value={bulkRange}
                onChange={setBulkRange}
                disabledDate={disableFutureDates}
                style={{ width: '100%' }}
              />
              <Text type="secondary">Pasted and new rows use these dates.</Text>
              <Button onClick={applyBulkRangeToAll} disabled={!bulkRange?.[0] || !bulkRange?.[1]}>
                Apply these dates to all rows
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: 0 }} />

        {/* Agent rows */}
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong>
            Agents ({rows.length}/{AGENT_REPORT_MAX_CAMPAIGNS} max, unique)
          </Text>
          <div style={{ maxHeight: 420, overflowY: 'auto', overflowX: 'hidden' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {rows.map((row, index) => {
                const errors = rowErrors[row.key];
                const status = errors ? 'error' : undefined;
                return (
                  <div key={row.key}>
                    <Row gutter={[10, 6]} align="middle" wrap>
                      <Col xs={24} md={11}>
                        <Input
                          value={row.agentId}
                          status={errors?.some(error => /agent/i.test(error)) ? status : undefined}
                          onChange={e => updateRow(row.key, { agentId: e.target.value })}
                          placeholder="Agent ID (24 characters)"
                          aria-label={`Agent ID for row ${index + 1}`}
                          allowClear
                        />
                      </Col>
                      <Col xs={20} md={11}>
                        <RangePicker
                          value={row.range}
                          status={errors?.some(error => /date/i.test(error)) ? status : undefined}
                          onChange={range => updateRow(row.key, { range })}
                          disabledDate={disableFutureDates}
                          style={{ width: '100%' }}
                          aria-label={`Date range for row ${index + 1}`}
                        />
                      </Col>
                      <Col xs={4} md={2}>
                        <Tooltip title="Remove row">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeRow(row.key)}
                            disabled={rows.length === 1}
                            aria-label={`Remove row ${index + 1}`}
                          />
                        </Tooltip>
                      </Col>
                    </Row>
                    {errors && (
                      <Text type="danger" style={{ fontSize: 12 }}>
                        {errors.join(' · ')}
                      </Text>
                    )}
                  </div>
                );
              })}
            </Space>
          </div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addRow}
            disabled={!canAddRow}
            block
          >
            {canAddRow ? 'Add agent' : `Limit of ${AGENT_REPORT_MAX_CAMPAIGNS} agents reached`}
          </Button>
        </Space>

        {(formError || submitError) && (
          <Alert type="error" showIcon message={formError || submitError} />
        )}

        <Button type="primary" size="large" onClick={onGenerate} loading={isSubmitting}>
          Generate report
        </Button>
      </Space>
    </Card>
  );
}

export default AgentReportForm;
