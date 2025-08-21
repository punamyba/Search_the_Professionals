// components/education/EducationSection.tsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';
import './education.css';

type Education = {
  id?: string;
  _id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: {
    month: string;
    year: string;
  };
  endDate: {
    month: string;
    year: string;
  };
  grade?: string;
  activities?: string;
}

type EducationFormData = {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  grade: string;
  activities: string;
}

interface EducationSectionProps {
  userId?: string;
  educations?: Education[];
  setEducations?: (educations: Education[]) => void;
}

export default function EducationSection({ userId, educations: propEducations, setEducations }: EducationSectionProps) {
  const [educationList, setEducationList] = useState<Education[]>(propEducations || []);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<EducationFormData>({
    defaultValues: {
      school: '',
      degree: '',
      fieldOfStudy: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      grade: '',
      activities: ''
    }
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Watch start and end years for validation
  const watchedValues = watch(['startYear', 'endYear', 'startMonth', 'endMonth']);
  const [startYear, endYear, startMonth, endMonth] = watchedValues;

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

  useEffect(() => {
    if (propEducations) {
      setEducationList(propEducations);
    }
  }, [propEducations]);

  const updateEducationState = (newEducations: Education[]) => {
    setEducationList(newEducations);
    if (setEducations) {
      setEducations(newEducations);
    }
  };

  const getEducationId = (education: Education) => {
    return education._id || education.id;
  };

  const openModal = (education?: Education) => {
    if (!isOwnProfile) {
      alert('You can only edit your own profile!');
      return;
    }

    if (education) {
      setEditingEducation(education);
      reset({
        school: education.school,
        degree: education.degree,
        fieldOfStudy: education.fieldOfStudy,
        startMonth: education.startDate.month,
        startYear: education.startDate.year,
        endMonth: education.endDate.month,
        endYear: education.endDate.year,
        grade: education.grade || '',
        activities: education.activities || ''
      });
    } else {
      setEditingEducation(null);
      reset();
    }
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    reset();
    setShowModal(false);
    setEditingEducation(null);
    document.body.classList.remove('modal-open');
  };

  const onSubmit = async (data: EducationFormData) => {
    if (!isOwnProfile) {
      alert('You can only edit your own profile!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingEducation 
        ? `http://localhost:3000/api/user/education/${getEducationId(editingEducation)}`
        : `http://localhost:3000/api/user/education`;
      
      const method = editingEducation ? 'PUT' : 'POST';
      
      const educationData = {
        school: data.school,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate: {
          month: data.startMonth,
          year: data.startYear
        },
        endDate: {
          month: data.endMonth,
          year: data.endYear
        },
        grade: data.grade,
        activities: data.activities
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(educationData)
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (editingEducation) {
          const updatedEducations = educationList.map(edu => 
            getEducationId(edu) === getEducationId(editingEducation) ? responseData.education : edu
          );
          updateEducationState(updatedEducations);
        } else {
          const newEducations = [...educationList, responseData.education];
          updateEducationState(newEducations);
        }
        
        closeModal();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save education');
      }
    } catch (error) {
      console.error('Error saving education:', error);
      alert('Network error occurred');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!isOwnProfile) {
      alert('You can only edit your own profile!');
      return;
    }

    if (confirm('Are you sure you want to delete this education?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/user/education/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const filteredEducations = educationList.filter(edu => getEducationId(edu) !== id);
          updateEducationState(filteredEducations);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete education');
        }
      } catch (error) {
        console.error('Error deleting education:', error);
        alert('Network error occurred');
      }
    }
  };

  return (
    <>
      <div className="sidebar-card">
        <div className="edu-card-header">
          <h3 className="card-title">
            <i className="fas fa-graduation-cap"></i> Education
          </h3>
          {isOwnProfile && (
            <button 
              className="edu-add-btn"
              onClick={() => openModal()}
              title="Add Education"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
        
        {educationList.length > 0 ? (
          <div className="edu-list">
            {educationList.map((edu, index) => (
              <div key={getEducationId(edu) || index} className="edu-item">
                <div className="edu-header">
                  <h4 className="edu-school">{edu.school}</h4>
                  {isOwnProfile && (
                    <div className="edu-actions">
                      <button 
                        className="edu-edit-btn"
                        onClick={() => openModal(edu)}
                        title="Edit"
                      >
                         <i className="fas fa-pen"></i>
                      </button>
                      <button 
                        className="edu-delete-btn"
                        onClick={() => handleDeleteEducation(getEducationId(edu)!)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
                
                {edu.degree && <p className="edu-degree">{edu.degree}</p>}
                {edu.fieldOfStudy && <p className="edu-field">{edu.fieldOfStudy}</p>}
                
                {(edu.startDate?.month || edu.startDate?.year || edu.endDate?.month || edu.endDate?.year) && (
                  <p className="edu-duration">
                    {edu.startDate?.month} {edu.startDate?.year} - {edu.endDate?.month} {edu.endDate?.year}
                  </p>
                )}
                
                {edu.grade && <p className="edu-grade">Grade: {edu.grade}</p>}
                {edu.activities && <p className="edu-activities">{edu.activities}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-edu-text">
            {isOwnProfile 
              ? "No education added yet. Click the + button to add your first education." 
              : "No education information available."}
          </p>
        )}
      </div>

      {/* Education Modal - Using Portal like Experience Section */}
      {showModal && isOwnProfile && (
        <>
          {typeof document !== 'undefined' && 
            document.body && 
            ReactDOM.createPortal(
              <div className="edu-modal-overlay" onClick={closeModal}>
                <div className="edu-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="edu-modal-header">
                    <h2>{editingEducation ? 'Edit education' : 'Add education'}</h2>
                    <button 
                      className="edu-close-btn"
                      onClick={closeModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="edu-form">
                    <div className="edu-form-group">
                      <label htmlFor="school">School*</label>
                      <input
                        type="text"
                        id="school"
                        placeholder="Ex: Boston University"
                        className={errors.school ? 'error' : ''}
                        {...register('school', {
                          required: 'School name is required',
                          minLength: {
                            value: 2,
                            message: 'School name must be at least 2 characters'
                          },
                          maxLength: {
                            value: 100,
                            message: 'School name cannot exceed 100 characters'
                          },
                          validate: {
                            notEmpty: (value) => value.trim() !== '' || 'School name cannot be empty'
                          }
                        })}
                      />
                      {errors.school && (
                        <span className="field-error">{errors.school.message}</span>
                      )}
                    </div>

                    <div className="edu-form-group">
                      <label htmlFor="degree">Degree*</label>
                      <input
                        type="text"
                        id="degree"
                        placeholder="Ex: Bachelor's"
                        className={errors.degree ? 'error' : ''}
                        {...register('degree', {
                          required: 'Degree is required',
                          minLength: {
                            value: 2,
                            message: 'Degree must be at least 2 characters'
                          },
                          maxLength: {
                            value: 50,
                            message: 'Degree cannot exceed 50 characters'
                          },
                          validate: {
                            notEmpty: (value) => value.trim() !== '' || 'Degree cannot be empty'
                          }
                        })}
                      />
                      {errors.degree && (
                        <span className="field-error">{errors.degree.message}</span>
                      )}
                    </div>

                    <div className="edu-form-group">
                      <label htmlFor="fieldOfStudy">Field of study*</label>
                      <input
                        type="text"
                        id="fieldOfStudy"
                        placeholder="Ex: Business"
                        className={errors.fieldOfStudy ? 'error' : ''}
                        {...register('fieldOfStudy', {
                          required: 'Field of study is required',
                          minLength: {
                            value: 2,
                            message: 'Field of study must be at least 2 characters'
                          },
                          maxLength: {
                            value: 50,
                            message: 'Field of study cannot exceed 50 characters'
                          },
                          validate: {
                            notEmpty: (value) => value.trim() !== '' || 'Field of study cannot be empty'
                          }
                        })}
                      />
                      {errors.fieldOfStudy && (
                        <span className="field-error">{errors.fieldOfStudy.message}</span>
                      )}
                    </div>

                    <div className="edu-form-row">
                      <div className="edu-form-group">
                        <label>Start date*</label>
                        <div className="edu-date-inputs">
                          <select
                            className={errors.startMonth ? 'error' : ''}
                            {...register('startMonth', {
                              required: 'Start month is required'
                            })}
                          >
                            <option value="">Month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                          <select
                            className={errors.startYear ? 'error' : ''}
                            {...register('startYear', {
                              required: 'Start year is required',
                              validate: {
                                notFuture: (value) => {
                                  if (!value) return true;
                                  const year = parseInt(value);
                                  return year <= currentYear || 'Start year cannot be in the future'
                                },
                                reasonable: (value) => {
                                  if (!value) return true;
                                  const year = parseInt(value);
                                  return year >= 1950 || 'Start year seems too old'
                                }
                              }
                            })}
                          >
                            <option value="">Year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        {(errors.startMonth || errors.startYear) && (
                          <span className="field-error">
                            {errors.startMonth?.message || errors.startYear?.message}
                          </span>
                        )}
                      </div>

                      <div className="edu-form-group">
                        <label>End date (or expected)*</label>
                        <div className="edu-date-inputs">
                          <select
                            className={errors.endMonth ? 'error' : ''}
                            {...register('endMonth', {
                              required: 'End month is required'
                            })}
                          >
                            <option value="">Month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                          <select
                            className={errors.endYear ? 'error' : ''}
                            {...register('endYear', {
                              required: 'End year is required',
                              validate: {
                                afterStart: (value, formValues) => {
                                  if (!value || !formValues.startYear) return true;
                                  const endYearNum = parseInt(value);
                                  const startYearNum = parseInt(formValues.startYear);
                                  
                                  if (endYearNum < startYearNum) {
                                    return 'End year must be after start year';
                                  }
                                  
                                  if (endYearNum === startYearNum && formValues.startMonth && formValues.endMonth) {
                                    const startMonthIndex = months.indexOf(formValues.startMonth);
                                    const endMonthIndex = months.indexOf(formValues.endMonth);
                                    if (endMonthIndex < startMonthIndex) {
                                      return 'End date must be after start date';
                                    }
                                  }
                                  
                                  return true;
                                },
                                notTooFuture: (value) => {
                                  if (!value) return true;
                                  const year = parseInt(value);
                                  return year <= currentYear + 10 || 'End year seems too far in the future'
                                }
                              }
                            })}
                          >
                            <option value="">Year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        {(errors.endMonth || errors.endYear) && (
                          <span className="field-error">
                            {errors.endMonth?.message || errors.endYear?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="edu-form-group">
                      <label htmlFor="grade">Grade</label>
                      <input
                        type="text"
                        id="grade"
                        placeholder="Ex: 3.8 GPA, First Class, 85%"
                        {...register('grade')}
                      />
                    </div>

                    <div className="edu-form-group">
                      <label htmlFor="activities">Activities and societies</label>
                      <textarea
                        id="activities"
                        rows={3}
                        placeholder="Ex: Student Council, Drama Club, Volunteer work..."
                        {...register('activities')}
                      />
                    </div>

                    <div className="edu-form-actions">
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={closeModal}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="edu-save-btn"
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
    </>
  );
}