import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form@7.55.0';
import { Card, Button, Input, Checkbox, Tabs, Select, Spin, message } from 'antd';
import {
  RightOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  BookOutlined,
  ProjectOutlined,
  TrophyOutlined,
  CodeOutlined,
  GlobalOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { CV } from '../lib/types';
import { cvService, cvTemplateService } from '../api/services';
import { CVTemplateSelectionModal } from '../components/cv/CVTemplateSelectionModal';

const { TextArea } = Input;

const StyledInput = React.forwardRef((props: any, ref: any) => (
  <Input
    {...props}
    ref={ref}
    className={`!border !border-gray-300 hover:!border-blue-500 focus:!border-blue-500 rounded-md shadow-sm ${props.className || ''}`}
  />
));

const StyledTextArea = React.forwardRef((props: any, ref: any) => (
  <TextArea
    {...props}
    ref={ref}
    className={`!border !border-gray-300 hover:!border-blue-500 focus:!border-blue-500 rounded-md shadow-sm ${props.className || ''}`}
  />
));

interface CVFormData {
  // CV Title
  title: string;

  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  currentPosition: string;
  avatar?: string;
  summary: string;
  objective: string;

  // CV Settings
  templateId: string;
  isPrimary: boolean;
  isPublic: boolean;

  // Dynamic Sections
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  workExperience: Array<{
    jobTitle: string;
    companyName: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  skills: Array<{
    name: string;
    level: string;
    yearsOfExperience: number;
  }>;

  projects: Array<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    url: string;
    role: string;
  }>;

  certifications: Array<{
    name: string;
    issuer: string;
    acquiredDate: string;
    description: string;
  }>;

  languages: Array<{
    name: string;
    proficiency: string;
    description: string;
  }>;

  achievements: Array<{
    title: string;
    description: string;
    acquiredDate: string;
  }>;

  activities: Array<{
    title: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  references: Array<{
    name: string;
    position: string;
    company: string;
    contact: string;
  }>;
}

export function CVEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCV, setIsLoadingCV] = useState(false);
  const [existingCV, setExistingCV] = useState<CV | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [pendingCVData, setPendingCVData] = useState<CVFormData | null>(null);

  const isEditMode = !!id;

  // Fetch CV data when in edit mode
  useEffect(() => {
    const fetchCV = async () => {
      if (!id) return;

      try {
        setIsLoadingCV(true);
        setFetchError(null);
        const cvData = await cvService.getCVById(id);
        console.log('Fetched CV data:', cvData);
        setExistingCV(cvData);
      } catch (error: any) {
        console.error('Failed to fetch CV:', error);
        const errorMessage = error?.message || 'Không thể tải thông tin CV';
        setFetchError(errorMessage);
        message.error(errorMessage);
      } finally {
        setIsLoadingCV(false);
      }
    };

    fetchCV();
  }, [id]);

  // Fetch available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await cvTemplateService.getActiveTemplates({ page: 1, limit: 100 });
        let templates: any[] = [];

        // Handle different response structures
        if (response && response.items && Array.isArray(response.items)) {
          templates = response.items;
        } else if (response && (response as any).data?.items && Array.isArray((response as any).data.items)) {
          templates = (response as any).data.items;
        } else if (Array.isArray(response)) {
          templates = response;
        }

        if (templates.length > 0) {
          setAvailableTemplates(templates.map(t => ({ id: t.id, name: t.name })));
        } else {
          console.warn('No templates available');
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        message.error('Không thể tải danh sách mẫu CV. Vui lòng thử lại sau.');
      }
    };

    fetchTemplates();
  }, []);

  const { register, control, handleSubmit, watch, setValue, reset, getValues, formState: { errors } } = useForm<CVFormData>({
    defaultValues: {
      title: '',
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      address: '',
      currentPosition: '',
      summary: '',
      objective: '',
      templateId: '',
      isPrimary: false,
      isPublic: false,
      education: [],
      workExperience: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      achievements: [],
      activities: [],
      references: [],
    },
    mode: 'onChange',
    shouldUnregister: false
  });

  // Update form when CV data is loaded
  useEffect(() => {
    if (existingCV) {
      const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return '';
        try {
          const dateObj = date instanceof Date ? date : new Date(date);
          if (isNaN(dateObj.getTime())) return '';
          return dateObj.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error, date);
          return '';
        }
      };

      const formData: CVFormData = {
        title: existingCV.title || '',
        fullName: existingCV.fullName || '',
        email: existingCV.email || '',
        phone: existingCV.phoneNumber || existingCV.phone || '',
        dateOfBirth: formatDate(existingCV.dateOfBirth),
        gender: existingCV.gender || 'MALE',
        address: existingCV.address || '',
        currentPosition: existingCV.currentPosition || '',
        summary: existingCV.summary || '',
        objective: existingCV.objective || '',
        templateId: existingCV.templateId || '',
        isPrimary: existingCV.isMain || false,
        isPublic: existingCV.isOpenForJob || false,
        education: Array.isArray(existingCV.educations) ? existingCV.educations.map(edu => ({
          institution: edu?.institution || '',
          degree: edu?.degree || '',
          startDate: formatDate(edu?.startDate),
          endDate: formatDate(edu?.endDate),
          description: edu?.description || '',
        })) : [],
        workExperience: Array.isArray(existingCV.workExperiences) ? existingCV.workExperiences.map(work => ({
          jobTitle: work?.title || '',
          companyName: work?.company || '',
          startDate: formatDate(work?.startDate),
          endDate: formatDate(work?.endDate),
          description: work?.description || '',
        })) : [],
        skills: Array.isArray(existingCV.skills) ? existingCV.skills.map(skill => ({
          name: skill?.skillName || skill?.name || '',
          level: skill?.level || 'INTERMEDIATE',
          yearsOfExperience: skill?.yearsOfExperience || 0,
        })) : [],
        projects: Array.isArray(existingCV.projects) ? existingCV.projects.map(project => ({
          name: project?.name || '',
          description: project?.description || '',
          startDate: formatDate(project?.startDate),
          endDate: formatDate(project?.endDate),
          url: project?.url || '',
          role: project?.role || '',
        })) : [],
        certifications: Array.isArray(existingCV.certifications) ? existingCV.certifications.map(cert => ({
          name: cert?.name || '',
          issuer: cert?.issuer || '',
          acquiredDate: formatDate(cert?.acquiredAt),
          description: cert?.description || '',
        })) : [],
        languages: Array.isArray(existingCV.languages) ? existingCV.languages.map(lang => ({
          name: lang?.name || '',
          proficiency: lang?.level || 'INTERMEDIATE',
          description: lang?.description || '',
        })) : [],
        achievements: Array.isArray(existingCV.achievements) ? existingCV.achievements.map(ach => ({
          title: ach?.title || '',
          description: ach?.description || '',
          acquiredDate: formatDate(ach?.acquiredAt),
        })) : [],
        activities: Array.isArray(existingCV.activities) ? existingCV.activities.map(act => ({
          title: act?.title || '',
          organization: act?.organization || '',
          startDate: formatDate(act?.startDate),
          endDate: formatDate(act?.endDate),
          description: act?.description || '',
        })) : [],
        references: Array.isArray(existingCV.references) ? existingCV.references.map(ref => ({
          name: ref?.name || '',
          position: ref?.position || '',
          company: ref?.company || '',
          contact: ref?.description || ref?.contact || '',
        })) : [],
      };

      console.log('Resetting form with data:', formData);

      // Use reset with specific options for field arrays
      reset(formData, {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false
      });

      // Log form values after reset to verify
      setTimeout(() => {
        console.log('Form values after reset:', getValues());
        console.log('Education fields:', getValues('education'));
      }, 100);
    }
  }, [existingCV, reset, getValues]);


  // Field arrays for dynamic sections
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control,
    name: 'workExperience',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills',
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: 'certifications',
  });

  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({
    control,
    name: 'languages',
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements',
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control,
    name: 'activities',
  });

  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({
    control,
    name: 'references',
  });

  // Helper function to convert date string (YYYY-MM-DD) to ISO datetime with Z suffix
  const toISODateTime = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) return undefined;
    // If already in ISO format with Z, return as is
    if (dateStr.endsWith('Z')) return dateStr;
    // Convert YYYY-MM-DD to YYYY-MM-DDTHH:mm:ssZ
    return `${dateStr}T00:00:00Z`;
  };

  // Function to actually save the CV with selected template
  const saveCV = async (data: CVFormData, templateId: string) => {
    try {
      setIsLoading(true);

      // Map form data to API request format
      const apiData: any = {
        title: data.title,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        dateOfBirth: toISODateTime(data.dateOfBirth),
        gender: data.gender || undefined,
        address: data.address || undefined,
        currentPosition: data.currentPosition || undefined,
        summary: data.summary || undefined,
        objective: data.objective || undefined,
        templateId: templateId || undefined,
        isMain: data.isPrimary || false,
        isOpenForJob: data.isPublic || false,
        // Map nested data
        educations: data.education?.map(edu => ({
          institution: edu.institution,
          degree: edu.degree || undefined,
          startDate: toISODateTime(edu.startDate),
          endDate: toISODateTime(edu.endDate),
          description: edu.description || undefined,
        })) || [],
        workExperiences: data.workExperience?.map(work => ({
          title: work.jobTitle,
          company: work.companyName,
          startDate: toISODateTime(work.startDate),
          endDate: toISODateTime(work.endDate),
          description: work.description || undefined,
        })) || [],
        skills: data.skills?.map(skill => ({
          skillName: skill.name,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience || undefined,
        })) || [],
        projects: data.projects?.map(project => ({
          name: project.name,
          description: project.description || undefined,
          startDate: toISODateTime(project.startDate),
          endDate: toISODateTime(project.endDate),
          url: project.url || undefined,
          role: project.role || undefined,
        })) || [],
        certifications: data.certifications?.map(cert => ({
          name: cert.name,
          issuer: cert.issuer || undefined,
          acquiredAt: toISODateTime(cert.acquiredDate),
          description: cert.description || undefined,
        })) || [],
        languages: data.languages?.map(lang => ({
          name: lang.name,
          level: lang.proficiency,
          description: lang.description || undefined,
        })) || [],
        achievements: data.achievements?.map(ach => ({
          title: ach.title,
          description: ach.description || undefined,
          acquiredAt: toISODateTime(ach.acquiredDate),
        })) || [],
        activities: data.activities?.map(act => ({
          title: act.title,
          organization: act.organization || undefined,
          startDate: toISODateTime(act.startDate),
          endDate: toISODateTime(act.endDate),
          description: act.description || undefined,
        })) || [],
        references: data.references?.map(ref => ({
          name: ref.name,
          position: ref.position || undefined,
          company: ref.company || undefined,
          description: ref.contact || undefined,
        })) || [],
      };

      if (isEditMode && id) {
        // Update existing CV
        await cvService.updateCV(id, apiData);
        message.success('CV đã được cập nhật thành công!');
      } else {
        // Create new CV
        await cvService.createCV(apiData);
        message.success('CV đã được tạo thành công!');
      }

      navigate('/candidate/cvs');
    } catch (error: any) {
      console.error('Failed to save CV:', error);
      message.error(error.message || 'Không thể lưu CV. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission - open template selection modal
  const onSubmit = async (data: CVFormData) => {
    if (!data.title || data.title.trim().length < 3) {
      message.error('Vui lòng nhập tiêu đề CV (tối thiểu 3 ký tự)');
      return;
    }

    if (!data.fullName || !data.email || !data.phone) {
      message.error('Vui lòng điền đầy đủ thông tin cá nhân (Họ tên, Email, Số điện thoại)');
      return;
    }

    // Store form data and open template selection modal
    setPendingCVData(data);
    setShowTemplateModal(true);
  };

  // Handle invalid submit (react-hook-form second argument)
  const onInvalid = (formErrors: any) => {
    try {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      const firstField = formErrors && Object.keys(formErrors)[0];
      if (firstField) {
        // Try to focus the first invalid input controlled by react-hook-form
        const el = document.querySelector(`[name="${firstField}"]`) as HTMLElement | null;
        if (el && typeof el.focus === 'function') el.focus();
      }
    } catch (e) {
      // ignore
    }
  };

  // Handle template selection from modal
  const handleTemplateSelect = async (templateId: string) => {
    if (pendingCVData) {
      await saveCV(pendingCVData, templateId);
      setPendingCVData(null);
    }
  };


  if (isLoadingCV) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">Đang tải thông tin CV...</p>
        </div>
      </div>
    );
  }

  // Show error state if fetch failed
  if (fetchError && isEditMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card style={{ maxWidth: 480, width: '100%' }}>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloseOutlined className="text-2xl text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không thể tải CV
            </h2>
            <p className="text-gray-600 mb-6">{fetchError}</p>
            <div className="flex gap-3 justify-center mt-2">
              <Button onClick={() => navigate('/candidate/cvs')}>
                Quay lại danh sách CV
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setFetchError(null);
                  window.location.reload();
                }}
              >
                Thử lại
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'personal',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined className="text-base" />
          <span className="hidden lg:inline">Cá nhân</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><UserOutlined className="text-lg" />Thông tin cá nhân</span>}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Họ và tên *</label>
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: 'Vui lòng nhập họ tên' }}
                  render={({ field }) => (
                    <StyledInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Nguyễn Văn A"
                      status={errors.fullName ? 'error' : ''}
                    />
                  )}
                />
                {errors.fullName && (
                  <p className="text-red-600 mt-1 text-sm">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Email *</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: 'Vui lòng nhập email' }}
                  render={({ field }) => (
                    <StyledInput
                      {...field}
                      value={field.value || ''}
                      type="email"
                      placeholder="email@example.com"
                      status={errors.email ? 'error' : ''}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-600 mt-1 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Số điện thoại *</label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'Vui lòng nhập số điện thoại' }}
                  render={({ field }) => (
                    <StyledInput
                      {...field}
                      value={field.value || ''}
                      placeholder="0123456789"
                      status={errors.phone ? 'error' : ''}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-red-600 mt-1 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Ngày sinh</label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true;
                      const inputDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
                      if (inputDate > today) {
                        return 'Ngày sinh không được lớn hơn ngày hiện tại';
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <StyledInput
                      {...field}
                      value={field.value || ''}
                      type="date"
                      status={errors.dateOfBirth ? 'error' : ''}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-600 mt-1 text-sm">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Giới tính</label>
                <Select
                  value={watch('gender')}
                  onChange={(value) => setValue('gender', value)}
                  style={{ width: '100%' }}
                  placeholder="Chọn giới tính"
                >
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </div>

              <div>
                <label className="block mb-2">Vị trí hiện tại</label>
                <Controller
                  name="currentPosition"
                  control={control}
                  render={({ field }) => (
                    <StyledInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Senior Developer"
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Địa chỉ</label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <StyledInput
                    {...field}
                    value={field.value || ''}
                    placeholder="Hà Nội, Việt Nam"
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-2">Giới thiệu bản thân</label>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <StyledTextArea
                    {...field}
                    value={field.value || ''}
                    placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm, điểm mạnh..."
                    rows={4}
                  />
                )}
              />
            </div>

            <div>
              <label className="block mb-2">Mục tiêu nghề nghiệp</label>
              <Controller
                name="objective"
                control={control}
                render={({ field }) => (
                  <StyledTextArea
                    {...field}
                    value={field.value || ''}
                    placeholder="Mô tả mục tiêu nghề nghiệp, định hướng phát triển..."
                    rows={4}
                  />
                )}
              />
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'education',
      label: (
        <span className="flex items-center gap-2">
          <BookOutlined className="text-base" />
          <span className="hidden lg:inline">Học vấn</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><BookOutlined className="text-lg" />Học vấn</span>}>
          <div className="space-y-4">
            {educationFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Học vấn {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeEducation(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Trường học *</label>
                      <Controller
                        name={`education.${index}.institution` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Đại học Bách Khoa"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Bằng cấp</label>
                      <Controller
                        name={`education.${index}.degree` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Cử nhân"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày bắt đầu</label>
                      <Controller
                        name={`education.${index}.startDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày kết thúc</label>
                      <Controller
                        name={`education.${index}.endDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả</label>
                    <Controller
                      name={`education.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả về quá trình học tập, thành tích..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendEducation({
                institution: '',
                degree: '',
                startDate: '',
                endDate: '',
                description: '',
              })}
              block
            >
              Thêm học vấn
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'experience',
      label: (
        <span className="flex items-center gap-2">
          <ProjectOutlined className="text-base" />
          <span className="hidden lg:inline">Kinh nghiệm</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><ProjectOutlined className="text-lg" />Kinh nghiệm làm việc</span>}>
          <div className="space-y-4">
            {workFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Kinh nghiệm {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeWork(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Vị trí công việc *</label>
                      <Controller
                        name={`workExperience.${index}.jobTitle` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Software Engineer"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Công ty *</label>
                      <Controller
                        name={`workExperience.${index}.companyName` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Công ty ABC"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày bắt đầu</label>
                      <Controller
                        name={`workExperience.${index}.startDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày kết thúc</label>
                      <Controller
                        name={`workExperience.${index}.endDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                            placeholder="Để trống nếu đang làm việc"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả công việc</label>
                    <Controller
                      name={`workExperience.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả trách nhiệm, thành tích trong công việc..."
                          rows={4}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendWork({
                jobTitle: '',
                companyName: '',
                startDate: '',
                endDate: '',
                description: '',
              })}
              block
            >
              Thêm kinh nghiệm
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'skills',
      label: (
        <span className="flex items-center gap-2">
          <CodeOutlined className="text-base" />
          <span className="hidden lg:inline">Kỹ năng</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><CodeOutlined className="text-lg" />Kỹ năng</span>}>
          <div className="space-y-4">
            {skillFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Kỹ năng {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSkill(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2">Tên kỹ năng *</label>
                      <Controller
                        name={`skills.${index}.name` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="JavaScript"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Mức độ</label>
                      <Controller
                        name={`skills.${index}.level` as const}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            style={{ width: '100%' }}
                          >
                            <Select.Option value="BEGINNER">Cơ bản</Select.Option>
                            <Select.Option value="INTERMEDIATE">Trung bình</Select.Option>
                            <Select.Option value="ADVANCED">Nâng cao</Select.Option>
                            <Select.Option value="EXPERT">Chuyên gia</Select.Option>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Số năm kinh nghiệm</label>
                      <Controller
                        name={`skills.${index}.yearsOfExperience` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            type="number"
                            placeholder="2"
                            min={0}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendSkill({
                name: '',
                level: 'INTERMEDIATE',
                yearsOfExperience: 0,
              })}
              block
            >
              Thêm kỹ năng
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'projects',
      label: (
        <span className="flex items-center gap-2">
          <ProjectOutlined className="text-base" />
          <span className="hidden lg:inline">Dự án</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><ProjectOutlined className="text-lg" />Dự án</span>}>
          <div className="space-y-4">
            {projectFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Dự án {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeProject(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Tên dự án *</label>
                      <Controller
                        name={`projects.${index}.name` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Website E-commerce"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Vai trò</label>
                      <Controller
                        name={`projects.${index}.role` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Full-stack Developer"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày bắt đầu</label>
                      <Controller
                        name={`projects.${index}.startDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày kết thúc</label>
                      <Controller
                        name={`projects.${index}.endDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2">URL dự án</label>
                      <Controller
                        name={`projects.${index}.url` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="https://example.com"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả dự án</label>
                    <Controller
                      name={`projects.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả về dự án, công nghệ sử dụng, kết quả đạt được..."
                          rows={4}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendProject({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                url: '',
                role: '',
              })}
              block
            >
              Thêm dự án
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'certifications',
      label: (
        <span className="flex items-center gap-2">
          <TrophyOutlined className="text-base" />
          <span className="hidden lg:inline">Chứng chỉ</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><TrophyOutlined className="text-lg" />Chứng chỉ</span>}>
          <div className="space-y-4">
            {certFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Chứng chỉ {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeCert(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Tên chứng chỉ *</label>
                      <Controller
                        name={`certifications.${index}.name` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="AWS Certified Solutions Architect"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Tổ chức cấp</label>
                      <Controller
                        name={`certifications.${index}.issuer` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Amazon Web Services"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày đạt được</label>
                      <Controller
                        name={`certifications.${index}.acquiredDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả</label>
                    <Controller
                      name={`certifications.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả về chứng chỉ..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendCert({
                name: '',
                issuer: '',
                acquiredDate: '',
                description: '',
              })}
              block
            >
              Thêm chứng chỉ
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'languages',
      label: (
        <span className="flex items-center gap-2">
          <GlobalOutlined className="text-base" />
          <span className="hidden lg:inline">Ngôn ngữ</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><GlobalOutlined className="text-lg" />Ngôn ngữ</span>}>
          <div className="space-y-4">
            {langFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Ngôn ngữ {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeLang(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Tên ngôn ngữ *</label>
                      <Controller
                        name={`languages.${index}.name` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Tiếng Anh"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Trình độ</label>
                      <Controller
                        name={`languages.${index}.proficiency` as const}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            style={{ width: '100%' }}
                          >
                            <Select.Option value="BEGINNER">Cơ bản</Select.Option>
                            <Select.Option value="INTERMEDIATE">Trung bình</Select.Option>
                            <Select.Option value="ADVANCED">Nâng cao</Select.Option>
                            <Select.Option value="EXPERT">Thành thạo</Select.Option>
                            <Select.Option value="NATIVE">Bản ngữ</Select.Option>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả</label>
                    <Controller
                      name={`languages.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả thêm về trình độ ngôn ngữ..."
                          rows={2}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendLang({
                name: '',
                proficiency: 'INTERMEDIATE',
                description: '',
              })}
              block
            >
              Thêm ngôn ngữ
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'achievements',
      label: (
        <span className="flex items-center gap-2">
          <TrophyOutlined className="text-base" />
          <span className="hidden lg:inline">Thành tích</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><TrophyOutlined className="text-lg" />Thành tích</span>}>
          <div className="space-y-4">
            {achievementFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Thành tích {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeAchievement(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Tiêu đề *</label>
                      <Controller
                        name={`achievements.${index}.title` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Giải nhất Hackathon"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày đạt được</label>
                      <Controller
                        name={`achievements.${index}.acquiredDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả</label>
                    <Controller
                      name={`achievements.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả về thành tích..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendAchievement({
                title: '',
                description: '',
                acquiredDate: '',
              })}
              block
            >
              Thêm thành tích
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'activities',
      label: (
        <span className="flex items-center gap-2">
          <TeamOutlined className="text-base" />
          <span className="hidden lg:inline">Hoạt động</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><TeamOutlined className="text-lg" />Hoạt động</span>}>
          <div className="space-y-4">
            {activityFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Hoạt động {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeActivity(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Tiêu đề *</label>
                      <Controller
                        name={`activities.${index}.title` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Tình nguyện viên"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Tổ chức</label>
                      <Controller
                        name={`activities.${index}.organization` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Tổ chức ABC"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày bắt đầu</label>
                      <Controller
                        name={`activities.${index}.startDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Ngày kết thúc</label>
                      <Controller
                        name={`activities.${index}.endDate` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            type="date"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Mô tả</label>
                    <Controller
                      name={`activities.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <StyledTextArea
                          {...field}
                          value={field.value || ''}
                          placeholder="Mô tả về hoạt động..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendActivity({
                title: '',
                organization: '',
                startDate: '',
                endDate: '',
                description: '',
              })}
              block
            >
              Thêm hoạt động
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'references',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined className="text-base" />
          <span className="hidden lg:inline">Tham chiếu</span>
        </span>
      ),
      children: (
        <Card title={<span className="flex items-center gap-2"><UserOutlined className="text-lg" />Tham chiếu</span>}>
          <div className="space-y-4">
            {refFields.map((field, index) => (
              <Card key={field.id} className="mb-4" size="small">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Người tham chiếu {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeRef(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Họ tên *</label>
                      <Controller
                        name={`references.${index}.name` as const}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Nguyễn Văn A"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Vị trí</label>
                      <Controller
                        name={`references.${index}.position` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Giám đốc"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Công ty</label>
                      <Controller
                        name={`references.${index}.company` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="Công ty ABC"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Liên hệ</label>
                      <Controller
                        name={`references.${index}.contact` as const}
                        control={control}
                        render={({ field }) => (
                          <StyledInput
                            {...field}
                            value={field.value || ''}
                            placeholder="email@example.com hoặc số điện thoại"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => appendRef({
                name: '',
                position: '',
                company: '',
                contact: '',
              })}
              block
            >
              Thêm người tham chiếu
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'settings',
      label: (
        <span className="flex items-center gap-2">
          <TrophyOutlined className="text-base" />
          <span className="hidden lg:inline">Cài đặt</span>
        </span>
      ),
      children: (
        <Card title="Cài đặt CV">
          <div className="space-y-6">
            <div>
              <label className="block mb-2">Tiêu đề CV *</label>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: 'Vui lòng nhập tiêu đề CV',
                  minLength: {
                    value: 3,
                    message: 'Tiêu đề CV phải có ít nhất 3 ký tự'
                  }
                }}
                render={({ field }) => (
                  <StyledInput
                    {...field}
                    value={field.value || ''}
                    placeholder="Ví dụ: CV Software Engineer"
                    status={errors.title ? 'error' : ''}
                  />
                )}
              />
              {errors.title && (
                <p className="text-red-600 mt-1 text-sm">{errors.title.message}</p>
              )}
              <p className="text-gray-500 mt-2 text-sm">
                Tên để phân biệt các CV của bạn
              </p>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Checkbox
                checked={watch('isPrimary')}
                onChange={(e) => setValue('isPrimary', e.target.checked)}
              >
                <div>
                  <div className="font-medium">Đặt làm CV chính</div>
                  <p className="text-gray-500 text-sm">
                    CV chính sẽ được sử dụng mặc định khi ứng tuyển nhanh
                  </p>
                </div>
              </Checkbox>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Checkbox
                checked={watch('isPublic')}
                onChange={(e) => setValue('isPublic', e.target.checked)}
              >
                <div>
                  <div className="font-medium">Công khai CV cho nhà tuyển dụng</div>
                  <p className="text-gray-500 text-sm">
                    Cho phép nhà tuyển dụng tìm thấy và liên hệ với bạn qua CV này
                  </p>
                </div>
              </Checkbox>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-6 text-sm">
          <button onClick={() => navigate('/candidate/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <RightOutlined className="text-base" />
          <button onClick={() => navigate('/candidate/cvs')} className="hover:text-blue-600">
            Quản lý CV
          </button>
          <RightOutlined className="text-base" />
          <span className="text-gray-900">
            {isEditMode ? 'Chỉnh sửa CV' : 'Tạo CV mới'}
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Chỉnh sửa CV' : 'Tạo CV mới'}
            </h1>
            <p className="text-gray-600">
              Điền thông tin chi tiết để tạo CV chuyên nghiệp
            </p>
          </div>
          <div className="flex gap-3">
            <Button icon={<CloseOutlined />} onClick={() => navigate('/candidate/cvs')}>
              Hủy
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className='glassmorphism rounded-lg p-4'>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="mb-6"
            tabBarStyle={{
              overflowX: 'auto',
              overflowY: 'hidden',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch'
            }}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-6 bg-white border rounded-lg glassmorphism mt-4">
            <div className="text-gray-600 text-sm">
              * Vui lòng điền đầy đủ thông tin bắt buộc
            </div>
            <div className="flex gap-3">

              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SaveOutlined />}
              >
                {isLoading ? 'Đang lưu...' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </form>

        {/* Template Selection Modal */}
        <CVTemplateSelectionModal
          open={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
          selectedTemplateId={watch('templateId')}
        />
      </div>
    </div>
  );
}
