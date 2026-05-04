import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Button,
  Card,
  Space,
  Tag,
  Divider,
  Typography,
  Row,
  Col,
  message,
  Spin,
  Breadcrumb,
  Tooltip
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  HomeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { JobStatus, JobType, ExperienceLevel, Job, SkillLevel } from '../../lib/types';
import { jobService, JobSkillInput } from '../../api/services';
import { INDUSTRIES } from '../../lib/constants';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Skill level labels
const skillLevelLabels: Record<SkillLevel, string> = {
  [SkillLevel.BEGINNER]: 'Cơ bản',
  [SkillLevel.INTERMEDIATE]: 'Trung bình',
  [SkillLevel.ADVANCED]: 'Nâng cao',
  [SkillLevel.EXPERT]: 'Chuyên gia',
};

interface RequirementBenefit {
  id?: string;
  title: string;
  description: string;
}

export function JobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();

  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const [requirements, setRequirements] = useState<RequirementBenefit[]>([]);
  const [benefits, setBenefits] = useState<RequirementBenefit[]>([]);
  const [skills, setSkills] = useState<JobSkillInput[]>([]);

  const [newRequirement, setNewRequirement] = useState({ title: '', description: '' });
  const [newBenefit, setNewBenefit] = useState({ title: '', description: '' });
  const [newSkill, setNewSkill] = useState<JobSkillInput>({
    skillName: '',
    level: SkillLevel.INTERMEDIATE,
    yearsOfExperience: null
  });

  // Fetch job data when in edit mode
  useEffect(() => {
    const fetchJob = async () => {
      if (!isEditMode || !id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const job = await jobService.getJobById(id);

        form.setFieldsValue({
          title: job.title,
          description: job.description,
          location: job.location,
          industry: job.industry,
          type: (job as any).jobType || job.type,
          experienceLevel: job.experienceLevel,
          expiresAt: job.expiresAt ? dayjs(job.expiresAt) : null,
          urgent: job.urgent,
          hideAmount: job.salary?.hideAmount,
          isNegotiable: job.salary?.isNegotiable,
          salaryMin: job.salary?.minAmount ? job.salary.minAmount / 1000000 : null,
          salaryMax: job.salary?.maxAmount ? job.salary.maxAmount / 1000000 : null,
          salaryCurrency: job.salary?.currency || 'VND',
        });

        setRequirements(job.requirements?.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || ''
        })) || []);

        setBenefits(job.benefits?.map(b => ({
          id: b.id,
          title: b.title,
          description: b.description || ''
        })) || []);

        setSkills(job.skills?.map(s => ({
          skillName: s.skillName,
          level: s.level,
          yearsOfExperience: s.yearsOfExperience,
        })) || []);
      } catch (error: any) {
        console.error('Failed to fetch job:', error);
        message.error(error?.message || 'Không thể tải thông tin công việc');
        navigate('/recruiter/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, isEditMode, navigate, form]);

  const handleSubmit = async (saveAs: 'draft' | 'active' = 'active') => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const apiData = {
        title: values.title,
        description: values.description,
        location: values.location,
        industry: values.industry || 'Other',
        experienceLevel: values.experienceLevel || undefined,
        type: values.type || undefined,
        urgent: values.urgent || false,
        status: saveAs === 'draft' ? JobStatus.DRAFT : JobStatus.ACTIVE,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
        salary: {
          minAmount: values.hideAmount ? undefined : (values.salaryMin ? values.salaryMin * 1000000 : undefined),
          maxAmount: values.hideAmount ? undefined : (values.salaryMax ? values.salaryMax * 1000000 : undefined),
          currency: values.salaryCurrency,
          isNegotiable: values.isNegotiable || false,
          hideAmount: values.hideAmount || false,
        },
        requirements: requirements.filter(r => r.title.trim()),
        benefits: benefits.filter(b => b.title.trim()),
        skills: skills.filter(s => s.skillName.trim()),
      };

      if (isEditMode && id) {
        await jobService.updateJob(id, apiData as any);
        message.success(saveAs === 'draft' ? 'Đã lưu nháp' : 'Đã cập nhật tin tuyển dụng');
      } else {
        await jobService.createJob(apiData as any);
        message.success(saveAs === 'draft' ? 'Đã lưu nháp tin tuyển dụng' : 'Đã tạo tin tuyển dụng');
      }

      navigate('/recruiter/jobs');
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        console.error('Failed to save job:', error);
        message.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.title.trim()) {
      setRequirements([...requirements, { ...newRequirement }]);
      setNewRequirement({ title: '', description: '' });
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.title.trim()) {
      setBenefits([...benefits, { ...newBenefit }]);
      setNewBenefit({ title: '', description: '' });
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.skillName.trim()) {
      const exists = skills.some(
        s => s.skillName.toLowerCase() === newSkill.skillName.trim().toLowerCase()
      );
      if (!exists) {
        setSkills([...skills, { ...newSkill, skillName: newSkill.skillName.trim() }]);
        setNewSkill({ skillName: '', level: SkillLevel.INTERMEDIATE, yearsOfExperience: null });
      } else {
        message.warning('Kỹ năng này đã tồn tại');
      }
    }
  };

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.skillName !== skillName));
  };

  const jobTypeLabels = {
    [JobType.FULL_TIME]: 'Toàn thời gian',
    [JobType.PART_TIME]: 'Bán thời gian',
    [JobType.CONTRACT]: 'Hợp đồng',
    [JobType.INTERNSHIP]: 'Thực tập',
    [JobType.FREELANCE]: 'Freelance',
  };

  const experienceLabels = {
    [ExperienceLevel.INTERN]: 'Thực tập sinh',
    [ExperienceLevel.FRESHER]: 'Fresher (0-1 năm)',
    [ExperienceLevel.JUNIOR]: 'Junior (1-2 năm)',
    [ExperienceLevel.MIDDLE]: 'Middle (2-4 năm)',
    [ExperienceLevel.SENIOR]: 'Senior (5+ năm)',
    [ExperienceLevel.LEAD]: 'Lead/Trưởng nhóm',
    [ExperienceLevel.MANAGER]: 'Manager',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-3 sm:px-4">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <Text type="secondary" className="text-sm sm:text-base">Đang tải thông tin công việc...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 sm:mb-6 text-xs sm:text-sm">
          <Breadcrumb.Item href="#" onClick={() => navigate('/recruiter/dashboard')}>
            <HomeOutlined /> Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item href="#" onClick={() => navigate('/recruiter/jobs')}>
            Tin tuyển dụng
          </Breadcrumb.Item>
          <Breadcrumb.Item>{isEditMode ? 'Chỉnh sửa' : 'Tạo mới'}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 text-center">
          <Title level={2} className="text-xl sm:text-2xl lg:text-3xl mb-2">
            {isEditMode ? 'Chỉnh sửa tin tuyển dụng' : 'Tạo tin tuyển dụng mới'}
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">
            Điền đầy đủ thông tin để thu hút ứng viên phù hợp
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={() => handleSubmit('active')}
          onFinishFailed={(errorInfo: any) => {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            if (errorInfo?.errorFields?.length) {
              try {
                form.scrollToField(errorInfo.errorFields[0].name as any);
              } catch (e) {
                // ignore scroll errors
              }
            }
          }}
          initialValues={{
            salaryCurrency: 'VND',
            urgent: false,
            hideAmount: false,
            isNegotiable: false,
          }}
        >
          {/* Thông tin cơ bản */}
          <Card
            className="glassmorphism mb-6 sm:mb-8"
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span className="text-sm sm:text-base">Thông tin cơ bản</span>
              </Space>
            }
          >
            <Form.Item
              label={<span className="text-xs sm:text-sm">Tiêu đề công việc</span>}
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc' }]}
            >
              <Input size="large" placeholder="Ví dụ: Senior Frontend Developer" className="text-sm sm:text-base" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs sm:text-sm">Mô tả công việc</span>}
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
            >
              <TextArea rows={6} className="sm:rows-8 text-sm sm:text-base" placeholder="Mô tả chi tiết về công việc, trách nhiệm, yêu cầu..." />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-xs sm:text-sm">Địa điểm</span>}
                  name="location"
                  rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Hà Nội, Hồ Chí Minh..."
                    className="text-sm sm:text-base"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="text-xs sm:text-sm">Ngành nghề</span>} name="industry">
                  <Select placeholder="Chọn ngành nghề" className="text-sm sm:text-base">
                    {INDUSTRIES.filter(i => i.value !== 'all').map((industry) => (
                      <Option key={industry.value} value={industry.value}>
                        {industry.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-xs sm:text-sm">Loại hình</span>}
                  name="type"
                  rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}
                >
                  <Select placeholder="Chọn loại hình" className="text-sm sm:text-base">
                    {Object.entries(jobTypeLabels).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="text-xs sm:text-sm">Kinh nghiệm yêu cầu</span>} name="experienceLevel">
                  <Select placeholder="Chọn cấp độ" className="text-sm sm:text-base">
                    {Object.entries(experienceLabels).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="text-xs sm:text-sm">Hạn nộp hồ sơ</span>} name="expiresAt">
                  <DatePicker
                    className="w-full text-sm sm:text-base"
                    format="DD/MM/YYYY"
                    placeholder="Chọn hạn nộp hồ sơ"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="text-xs sm:text-sm">Tuyển gấp</span>} name="urgent" valuePropName="checked">
                  <div className="pt-2 flex items-center gap-2">
                    <Switch /> 
                    <ThunderboltOutlined style={{ color: '#ff4d4f' }} /> 
                    <span className="text-xs sm:text-sm">Ưu tiên hiển thị</span>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>


          {/* Mức lương */}
          <Card
            className="glassmorphism mb-6 sm:mb-8"
            title={
              <Space>
                <DollarOutlined style={{ color: '#52c41a' }} />
                <span className="text-sm sm:text-base">Mức lương</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="hideAmount" valuePropName="checked">
                  <div className="flex items-center gap-2">
                    <Switch /> 
                    <span className="text-xs sm:text-sm">Thỏa thuận (ẩn mức lương)</span>
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="isNegotiable" valuePropName="checked">
                  <div className="flex items-center gap-2">
                    <Switch /> 
                    <span className="text-xs sm:text-sm">Có thể thương lượng</span>
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.hideAmount !== curr.hideAmount}>
              {({ getFieldValue }) =>
                !getFieldValue('hideAmount') && (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label={<span className="text-xs sm:text-sm">Tối thiểu (triệu VND)</span>} name="salaryMin">
                        <InputNumber
                          min={0}
                          className="w-full text-sm sm:text-base"
                          placeholder="10"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label={<span className="text-xs sm:text-sm">Tối đa (triệu VND)</span>} name="salaryMax">
                        <InputNumber
                          min={0}
                          className="w-full text-sm sm:text-base"
                          placeholder="20"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                      <Form.Item label={<span className="text-xs sm:text-sm">Đơn vị tiền</span>} name="salaryCurrency">
                        <Select className="text-sm sm:text-base">
                          <Option value="VND">VND</Option>
                          <Option value="USD">USD</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )
              }
            </Form.Item>
          </Card>

          {/* Yêu cầu công việc */}
          <Card
            className="glassmorphism mb-6 sm:mb-8"
            title={
              <Space>
                <FileTextOutlined style={{ color: '#fa8c16' }} />
                <span className="text-sm sm:text-base">Yêu cầu công việc</span>
              </Space>
            }
          >
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                placeholder="Tiêu đề yêu cầu"
                value={newRequirement.title}
                onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                className="text-sm sm:text-base flex-1"
              />
              <Input
                placeholder="Mô tả chi tiết"
                value={newRequirement.description}
                onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                onPressEnter={addRequirement}
                className="text-sm sm:text-base flex-1"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addRequirement}
                disabled={!newRequirement.title.trim()}
                className="w-full sm:w-auto"
              >
                Thêm
              </Button>
            </div>

            {requirements.map((req, index) => (
              <Card
                key={index}
                size="small"
                className="glassmorphism mb-6 border-l-4 border-orange-500"
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeRequirement(index)}
                  />
                }
              >
                <div className="font-semibold text-sm sm:text-base mb-1">{req.title}</div>
                {req.description && (
                  <Text type="secondary" className="text-xs sm:text-sm">
                    {req.description}
                  </Text>
                )}
              </Card>
            ))}
          </Card>

          {/* Phúc lợi */}
          <Card
            className="glassmorphism mb-6 sm:mb-8"
            title={
              <Space>
                <GiftOutlined style={{ color: '#722ed1' }} />
                <span className="text-sm sm:text-base">Phúc lợi</span>
              </Space>
            }
          >
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                placeholder="Tiêu đề phúc lợi"
                value={newBenefit.title}
                onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
                className="text-sm sm:text-base flex-1"
              />
              <Input
                placeholder="Mô tả chi tiết"
                value={newBenefit.description}
                onChange={(e) => setNewBenefit({ ...newBenefit, description: e.target.value })}
                onPressEnter={addBenefit}
                className="text-sm sm:text-base flex-1"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addBenefit}
                disabled={!newBenefit.title.trim()}
                className="w-full sm:w-auto"
              >
                Thêm
              </Button>
            </div>

            {benefits.map((benefit, index) => (
              <Card
                key={index}
                size="small"
                className="glassmorphism mb-6 border-l-4 border-purple-600"
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeBenefit(index)}
                  />
                }
              >
                <div className="font-semibold text-sm sm:text-base mb-1">{benefit.title}</div>
                {benefit.description && (
                  <Text type="secondary" className="text-xs sm:text-sm">
                    {benefit.description}
                  </Text>
                )}
              </Card>
            ))}
          </Card>

          {/* Kỹ năng yêu cầu */}
          <Card
            className="glassmorphism mb-6 sm:mb-8"
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                <span className="text-sm sm:text-base">Kỹ năng yêu cầu</span>
              </Space>
            }
          >
            <Row gutter={[8, 8]} className="mb-4">
              <Col xs={24} sm={12} md={10}>
                <Input
                  placeholder="Tên kỹ năng"
                  value={newSkill.skillName}
                  onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                  onPressEnter={addSkill}
                  className="text-sm sm:text-base"
                />
              </Col>
              <Col xs={12} sm={6} md={6}>
                <Select
                  className="w-full text-sm sm:text-base"
                  placeholder="Cấp độ"
                  value={newSkill.level}
                  onChange={(value) => setNewSkill({ ...newSkill, level: value })}
                >
                  {Object.entries(skillLevelLabels).map(([value, label]) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={6} md={5}>
                <InputNumber
                  className="w-full text-sm sm:text-base"
                  placeholder="Số năm KN"
                  min={0}
                  max={50}
                  value={newSkill.yearsOfExperience}
                  onChange={(value) => setNewSkill({ ...newSkill, yearsOfExperience: value })}
                />
              </Col>
              <Col xs={24} sm={24} md={3}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addSkill}
                  disabled={!newSkill.skillName.trim()}
                  block
                  className="w-full sm:w-auto"
                >
                  Thêm
                </Button>
              </Col>
            </Row>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeSkill(skill.skillName)}
                  className="text-xs sm:text-sm mb-2"
                >
                  <strong>{skill.skillName}</strong> • {skillLevelLabels[skill.level]}
                  {skill.yearsOfExperience && ` • ${skill.yearsOfExperience} năm`}
                </Tag>
              ))}
            </div>
          </Card>

          {/* Action buttons */}
          <Card className="glassmorphism">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <Button 
                size="large" 
                onClick={() => navigate('/recruiter/jobs')}
                className="w-full sm:w-auto order-3 sm:order-1"
              >
                Hủy
              </Button>
              <Button
                size="large"
                icon={<SaveOutlined />}
                onClick={() => handleSubmit('draft')}
                loading={isSaving}
                className="w-full sm:w-auto order-2"
              >
                Lưu nháp
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                htmlType="submit"
                loading={isSaving}
                className="w-full sm:w-auto order-1 sm:order-3"
              >
                {isEditMode ? 'Cập nhật & Đăng' : 'Đăng tin'}
              </Button>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
