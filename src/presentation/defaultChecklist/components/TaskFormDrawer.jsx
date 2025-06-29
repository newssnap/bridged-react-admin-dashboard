import React from 'react';
import { Drawer, Form, Input, Button, Space, Upload, List, Image } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const TaskFormDrawer = ({
  isOpen,
  onClose,
  isEditing,
  form,
  onSubmit,
  isLoading,
  isUploadingImage,
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
}) => {
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEditing ? 'Edit Task' : 'Add New Task'}
      placement="right"
      onClose={handleClose}
      open={isOpen}
      width={600}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()} loading={isLoading}>
            {isEditing ? 'Update Task' : 'Add Task'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="title"
          label="Task Title"
          rules={[
            {
              required: true,
              message: 'Please enter a title for the task',
            },
          ]}
        >
          <Input placeholder="Enter task title" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea placeholder="Enter task description" rows={4} />
        </Form.Item>

        <Form.Item label="Upload Images">
          <Upload
            beforeUpload={file => {
              onFileUpload(file);
              return false; // Prevent default upload behavior
            }}
            showUploadList={false}
            accept="image/*"
          >
            <Button
              icon={<UploadOutlined />}
              loading={isUploadingImage}
              disabled={isUploadingImage}
            >
              Select Image
            </Button>
          </Upload>
        </Form.Item>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <Form.Item label="Uploaded Files">
            <List
              size="small"
              dataSource={uploadedFiles}
              renderItem={file => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => onRemoveFile(file)}
                      danger
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={file.url}
                        alt={file.fileName}
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover' }}
                      />
                    }
                    title={file.fileName}
                    description={`Type: ${file.type}`}
                  />
                </List.Item>
              )}
            />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default TaskFormDrawer;
