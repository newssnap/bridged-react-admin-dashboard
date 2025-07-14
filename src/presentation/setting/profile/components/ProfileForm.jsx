import { Input, Select, Upload, Typography, Col, Row, Skeleton, notification, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import useImageHandlers from '../../../../utils/controllers/useImageHandlers';
import { setUserData } from '../../../../redux/slices/user/profileSlice';
import { useState } from 'react';
import { allLanguages } from '../../../../constants/app/allLanguages';
import ThemeSelector from './ThemeSelector';

const { Title } = Typography;

const ProfileTitles = ({ title, description }) => {
  return (
    <Col span={24} style={{ marginBottom: 'var(--mpr-3)' }}>
      <Title level={3} style={{ fontWeight: 300 }}>
        {title}
      </Title>
      <p style={{ marginTop: 'var(--mpr-3)' }} className="opacity05">
        {description}
      </p>
    </Col>
  );
};

function ProfileForm({ userData }) {
  const [currentUploadType, setCurrentUploadType] = useState('');
  const { uploadImage, isLoading: uploadImageIsloading } = useImageHandlers();
  const dispatch = useDispatch();
  const { firstname, lastname, companyName, language, photo, companyLogo } = userData;

  // Function to render the background image component
  const renderImageComp = url =>
    url && (
      <img
        style={{
          width: '100%',
          padding: 'var(--mpr-3)',
          borderRadius: 'var(--mpr-3)',
        }}
        alt="Uploaded"
        src={url}
      />
    );

  const handleChange = e => {
    const { name, value } = e.target;
    dispatch(
      setUserData({
        ...userData,
        [name]: value,
      })
    );
  };

  const handleImageUpload = async ({ file }, type) => {
    setCurrentUploadType(type);
    const imgSrc = await uploadImage(file);
    handleChange({
      target: {
        name: type,
        value: imgSrc || '',
      },
    });
    setCurrentUploadType('');

    if (imgSrc) {
      notification.success({
        description: 'Photo Uploaded',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  return (
    <Col span={24}>
      <Row gutter={[30, 30]}>
        {ProfileTitles({
          title: 'Personal Information',
          description: 'Your information will remain private and confidential',
        })}

        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
          <p style={{ marginBottom: 'var(--mpr-3)' }}>First Name:</p>
          <Input
            size="large"
            placeholder="Enter your first name"
            value={firstname}
            name="firstname"
            onChange={handleChange}
          />
        </Col>
        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
          <p style={{ marginBottom: 'var(--mpr-3)' }}>Last Name:</p>
          <Input
            size="large"
            placeholder="Enter your last name"
            value={lastname}
            name="lastname"
            onChange={handleChange}
          />
        </Col>
        <Col span={24}>
          <p style={{ marginBottom: 'var(--mpr-2)' }}>Profile Photo (up to 1.5 mb)</p>

          {currentUploadType === 'photo' && uploadImageIsloading ? (
            <Skeleton.Button
              active
              style={{
                height: '100px',
                width: '100px',
              }}
            />
          ) : (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={e => {
                handleImageUpload(e, 'photo');
              }}
              accept="image/*"
            >
              {photo && renderImageComp(photo)}
              {!photo && <PlusOutlined style={{ opacity: 1 }} />}
            </Upload>
          )}
        </Col>

        <Col {...{ xs: 24, sm: 24, md: 12, lg: 8 }}>
          <ThemeSelector />
        </Col>

        <Col span={24}>
          <Divider style={{ margin: 0 }} />
        </Col>

        {ProfileTitles({
          title: 'Company Information',
          description: 'This information will be shared publicly, so please choose carefully.',
        })}

        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
          <p style={{ marginBottom: 'var(--mpr-3)' }}>Company Name:</p>
          <Input
            size="large"
            placeholder="Enter your company name"
            value={companyName}
            name="companyName"
            onChange={handleChange}
          />
        </Col>

        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
          <p style={{ marginBottom: 'var(--mpr-3)' }}>Language:</p>
          <Select
            variant="filled"
            size="large"
            style={{ width: '100%' }}
            placeholder="Eg: English"
            value={language}
            onChange={value =>
              handleChange({
                target: {
                  value: value,
                  name: 'language',
                },
              })
            }
            options={allLanguages}
          ></Select>
        </Col>
        <Col span={24}>
          <p style={{ marginBottom: 'var(--mpr-2)' }}>Company Logo (up to 1.5 mb)</p>

          {currentUploadType === 'companyLogo' && uploadImageIsloading ? (
            <Skeleton.Button
              active
              style={{
                height: '100px',
                width: '100px',
              }}
            />
          ) : (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={e => {
                handleImageUpload(e, 'companyLogo');
              }}
              accept="image/*"
            >
              {companyLogo && renderImageComp(companyLogo)}
              {!companyLogo && <PlusOutlined style={{ opacity: 1 }} />}
            </Upload>
          )}
        </Col>
      </Row>
    </Col>
  );
}

export default ProfileForm;
