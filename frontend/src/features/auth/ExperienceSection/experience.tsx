import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import './experience.css';

type Experience = {
  id: string;
  title: string;
  company: string;
  employmentType: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  location: string;
  locationType: string;
  description: string;
  isCurrentRole: boolean;
};

interface ExperienceSectionProps {
  userId?: string;
}

type FormData = Omit<Experience, 'id'>;

export default function ExperienceSection({ userId }: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const employmentTypes = ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal'];
  const locationTypes = ['On-site', 'Remote', 'Hybrid'];

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      company: '',
      employmentType: 'Full-time',
      startMonth: 'January',
      startYear: currentYear.toString(),
      endMonth: 'January',
      endYear: currentYear.toString(),
      location: '',
      locationType: 'On-site',
      description: '',
      isCurrentRole: false
    }
  });

  const watchIsCurrentRole = watch('isCurrentRole');
  const watchStartMonth = watch('startMonth');
  const watchStartYear = watch('startYear');
  const watchEndMonth = watch('endMonth');
  const watchEndYear = watch('endYear');

  // Custom validation for dates
  const validateDates = (startMonth: string, startYear: string, endMonth: string, endYear: string, isCurrentRole: boolean) => {
    const now = new Date();
    const startDate = new Date(parseInt(startYear), months.indexOf(startMonth));
    
    // Check if start date is in the future
    if (startDate > now) {
      return 'Start date cannot be in the future';
    }

    // If not current role, validate end date
    if (!isCurrentRole) {
      const endDate = new Date(parseInt(endYear), months.indexOf(endMonth));
      
      // End date cannot be in the future
      if (endDate > now) {
        return 'End date cannot be in the future';
      }
      
      // End date must be after start date
      if (parseInt(endYear) < parseInt(startYear) || 
          (parseInt(endYear) === parseInt(startYear) && months.indexOf(endMonth) < months.indexOf(startMonth))) {
        return 'End date must be after start date';
      }
    }

    return true;
  };

  // Check if current user is viewing their own profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId || payload.id);
        setIsOwnProfile(payload.userId === userId || payload.id === userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [userId]);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/user/experience/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setExperiences(data.experiences || []);
        }
      } catch (error) {
        console.error('Error fetching experiences:', error);
      }
    };

    if (userId) {
      fetchExperiences();
    }
  }, [userId]);

  // Validate dates whenever date fields change
  useEffect(() => {
    const dateValidation = validateDates(watchStartMonth, watchStartYear, watchEndMonth, watchEndYear, watchIsCurrentRole);
    
    if (dateValidation !== true) {
      setError('root.dateError', { 
        type: 'manual', 
        message: dateValidation 
      });
    } else {
      clearErrors('root.dateError');
    }
  }, [watchStartMonth, watchStartYear, watchEndMonth, watchEndYear, watchIsCurrentRole, setError, clearErrors]);

  const openModal = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      reset({
        title: experience.title,
        company: experience.company,
        employmentType: experience.employmentType,
        startMonth: experience.startMonth,
        startYear: experience.startYear,
        endMonth: experience.endMonth,
        endYear: experience.endYear,
        location: experience.location,
        locationType: experience.locationType,
        description: experience.description,
        isCurrentRole: experience.isCurrentRole
      });
    } else {
      setEditingExperience(null);
      reset({
        title: '',
        company: '',
        employmentType: 'Full-time',
        startMonth: 'January',
        startYear: currentYear.toString(),
        endMonth: 'January',
        endYear: currentYear.toString(),
        location: '',
        locationType: 'On-site',
        description: '',
        isCurrentRole: false
      });
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExperience(null);
    document.body.classList.remove('modal-open');
  };

  const onSubmit = async (data: FormData) => {
    if (!isOwnProfile) {
      alert('You can only edit your own profile!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingExperience 
        ? `http://localhost:3000/api/user/experience/${editingExperience.id}`
        : `http://localhost:3000/api/user/experience`;
      
      const method = editingExperience ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (editingExperience) {
          setExperiences(prev => prev.map(exp => 
            exp.id === editingExperience.id ? responseData.experience : exp
          ));
        } else {
          setExperiences(prev => [...prev, responseData.experience]);
        }
        
        closeModal();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save experience');
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Network error occurred');
    }
  };

  const deleteExperience = async (id: string) => {
    if (!isOwnProfile) {
      alert('You can only edit your own profile!');
      return;
    }

    if (confirm('Are you sure you want to delete this experience?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/user/experience/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setExperiences(prev => prev.filter(exp => exp.id !== id));
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete experience');
        }
      } catch (error) {
        console.error('Error deleting experience:', error);
        alert('Network error occurred');
      }
    }
  };

  const formatDuration = (experience: Experience) => {
    if (experience.isCurrentRole) {
      return `${experience.startMonth} ${experience.startYear} - Present`;
    }
    return `${experience.startMonth} ${experience.startYear} - ${experience.endMonth} ${experience.endYear}`;
  };

  return (
    <div className="experience-section">
      <div className="section-header">
        <h3 className="section-title">
          <i className="fas fa-briefcase"></i> Experience
        </h3>
        {isOwnProfile && (
          <button className="add-experience-btn" onClick={() => openModal()}>
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>

      <div className="experiences-list">
        {experiences.length === 0 ? (
          <p className="no-experience">
            {isOwnProfile 
              ? "No experience added yet. Click the + button to add your first experience." 
              : "No experience information available."}
          </p>
        ) : (
          experiences.map(experience => (
            <div key={experience.id} className="experience-item">
              <div className="experience-header">
                <div className="experience-main-info">
                  <h4 className="experience-title">{experience.title}</h4>
                  <p className="experience-company">{experience.company}</p>
                  <p className="experience-duration">{formatDuration(experience)}</p>
                  <p className="experience-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {experience.location} · {experience.locationType}
                  </p>
                </div>
                {isOwnProfile && (
                  <div className="experience-actions">
                    <button className="edit-btn" onClick={() => openModal(experience)}>
                      <i className="fas fa-pen"></i>
                    </button>
                    <button className="delete-btn" onClick={() => deleteExperience(experience.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
              {experience.description && (
                <p className="experience-description">{experience.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && isOwnProfile && (
        <>
          {typeof document !== 'undefined' && 
            document.body && 
            ReactDOM.createPortal(
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{editingExperience ? 'Edit experience' : 'Add experience'}</h2>
                    <button className="close-btn" onClick={closeModal}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="experience-form">
                    {/* General date error */}
                    {errors.root?.dateError && (
                      <div className="form-error general-error">
                        {errors.root.dateError.message}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="title">Title*</label>
                      <Controller
                        name="title"
                        control={control}
                        rules={{
                          required: 'Job title is required',
                          minLength: {
                            value: 2,
                            message: 'Job title must be at least 2 characters long'
                          },
                          maxLength: {
                            value: 100,
                            message: 'Job title cannot exceed 100 characters'
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            id="title"
                            placeholder="Ex: Retail Sales Manager"
                            className={errors.title ? 'error' : ''}
                          />
                        )}
                      />
                      {errors.title && <span className="form-error">{errors.title.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="employmentType">Employment type*</label>
                      <Controller
                        name="employmentType"
                        control={control}
                        rules={{
                          required: 'Employment type is required'
                        }}
                        render={({ field }) => (
                          <select
                            {...field}
                            id="employmentType"
                            className={errors.employmentType ? 'error' : ''}
                          >
                            {employmentTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.employmentType && <span className="form-error">{errors.employmentType.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="company">Company or organization*</label>
                      <Controller
                        name="company"
                        control={control}
                        rules={{
                          required: 'Company name is required',
                          minLength: {
                            value: 2,
                            message: 'Company name must be at least 2 characters long'
                          },
                          maxLength: {
                            value: 100,
                            message: 'Company name cannot exceed 100 characters'
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            id="company"
                            placeholder="Ex: Microsoft"
                            className={errors.company ? 'error' : ''}
                          />
                        )}
                      />
                      {errors.company && <span className="form-error">{errors.company.message}</span>}
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <Controller
                          name="isCurrentRole"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={onChange}
                            />
                          )}
                        />
                        I am currently working in this role
                      </label>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Start date*</label>
                        <div className="date-inputs">
                          <Controller
                            name="startMonth"
                            control={control}
                            rules={{ required: 'Start month is required' }}
                            render={({ field }) => (
                              <select {...field}>
                                {months.map(month => (
                                  <option key={month} value={month}>{month}</option>
                                ))}
                              </select>
                            )}
                          />
                          <Controller
                            name="startYear"
                            control={control}
                            rules={{ required: 'Start year is required' }}
                            render={({ field }) => (
                              <select {...field}>
                                {years.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                      </div>

                      {!watchIsCurrentRole && (
                        <div className="form-group">
                          <label>End date*</label>
                          <div className="date-inputs">
                            <Controller
                              name="endMonth"
                              control={control}
                              rules={{ required: !watchIsCurrentRole ? 'End month is required' : false }}
                              render={({ field }) => (
                                <select {...field}>
                                  {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                  ))}
                                </select>
                              )}
                            />
                            <Controller
                              name="endYear"
                              control={control}
                              rules={{ required: !watchIsCurrentRole ? 'End year is required' : false }}
                              render={({ field }) => (
                                <select {...field}>
                                  {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                  ))}
                                </select>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">Location*</label>
                      <Controller
                        name="location"
                        control={control}
                        rules={{
                          required: 'Location is required',
                          minLength: {
                            value: 2,
                            message: 'Location must be at least 2 characters long'
                          },
                          maxLength: {
                            value: 100,
                            message: 'Location cannot exceed 100 characters'
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            id="location"
                            placeholder="Ex: London, United Kingdom"
                            className={errors.location ? 'error' : ''}
                          />
                        )}
                      />
                      {errors.location && <span className="form-error">{errors.location.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="locationType">Location type</label>
                      <Controller
                        name="locationType"
                        control={control}
                        render={({ field }) => (
                          <select {...field} id="locationType">
                            {locationTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        )}
                      />
                      <small className="form-hint">Pick a location type (ex: remote)</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <Controller
                        name="description"
                        control={control}
                        rules={{
                          maxLength: {
                            value: 2000,
                            message: 'Description cannot exceed 2000 characters'
                          }
                        }}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            id="description"
                            placeholder="List your major duties and successes, highlighting specific projects"
                            rows={4}
                            className={errors.description ? 'error' : ''}
                          />
                        )}
                      />
                      {errors.description && <span className="form-error">{errors.description.message}</span>}
                      <small className="form-hint">{watch('description')?.length || 0}/2,000</small>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={closeModal}>
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="save-btn" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )
          }
        </>
      )}
    </div>
  );
}