import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import './skill.css';

type Skill = {
  _id: string;
  skillName: string;
  level: string;
};

type SkillFormData = {
  skillName: string;
  level: string;
};

type SkillsSectionProps = {
  skills?: Skill[];
  userId?: string;
  isOwnProfile?: boolean;
  onSkillsUpdate?: (skills: Skill[]) => void;
};

export default function SkillsSection({ skills = [], userId, isOwnProfile, onSkillsUpdate }: SkillsSectionProps) {
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<SkillFormData>({
    defaultValues: {
      skillName: '',
      level: 'Intermediate'
    }
  });

  // Memoize skills to prevent unnecessary re-renders
  const memoizedSkills = useMemo(() => skills, [skills]);

  // Update local skills only when skills prop actually changes
  useEffect(() => {
    if (memoizedSkills && memoizedSkills.length !== localSkills.length) {
      setLocalSkills(memoizedSkills);
    }
  }, [memoizedSkills, localSkills.length]);

  // Memoized callback to prevent re-renders
  const updateSkills = useCallback((newSkills: Skill[]) => {
    setLocalSkills(newSkills);
    if (onSkillsUpdate) {
      onSkillsUpdate(newSkills);
    }
  }, [onSkillsUpdate]);

  const showModal = useCallback(() => {
    setShowAddModal(true);
    document.body.classList.add('modal-open');
  }, []);

  const hideModal = useCallback(() => {
    setShowAddModal(false);
    reset();
    clearErrors();
    document.body.classList.remove('modal-open');
  }, [reset, clearErrors]);

  // Check for duplicate skills
  const checkDuplicateSkill = useCallback((skillName: string) => {
    const trimmedSkill = skillName.trim().toLowerCase();
    const existingSkill = localSkills.find(skill => 
      skill.skillName.toLowerCase() === trimmedSkill
    );
    return existingSkill ? 'This skill already exists in your profile' : true;
  }, [localSkills]);

  const onSubmit = useCallback(async (data: SkillFormData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/skills/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillName: data.skillName.trim(),
          level: data.level
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        const updatedSkills = [responseData.skill, ...localSkills];
        updateSkills(updatedSkills);
        hideModal();
      } else {
        if (responseData.message?.includes('duplicate') || responseData.message?.includes('already exists')) {
          setError('skillName', {
            type: 'manual',
            message: 'This skill already exists in your profile'
          });
        } else {
          setError('root.serverError', {
            type: 'manual',
            message: responseData.message || 'Failed to add skill'
          });
        }
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      setError('root.serverError', {
        type: 'manual',
        message: 'Network error occurred. Please try again.'
      });
    }
  }, [localSkills, updateSkills, hideModal, setError]);

  const handleDeleteSkill = useCallback(async (skillId: string, skillName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${skillName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/user/skills/delete/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedSkills = localSkills.filter(skill => skill._id !== skillId);
        updateSkills(updatedSkills);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill. Please try again.');
    }
  }, [localSkills, updateSkills]);

  const getSkillLevelColor = useCallback((level: string) => {
    switch (level) {
      case 'Beginner': return '#95a5a6';
      case 'Intermediate': return '#3498db';
      case 'Advanced': return '#e67e22';
      case 'Expert': return '#e74c3c';
      default: return '#3498db';
    }
  }, []);

  return (
    <>
      <div className="skills-header">
        <h3 className="section-title">
          <i className="fas fa-code"></i> Skills
        </h3>
        {isOwnProfile && (
          <button 
            className="add-skill-btn"
            onClick={showModal}
            title="Add new skill"
          >
            <i className="fas fa-plus"></i>
            Add Skill
          </button>
        )}
      </div>

      <div className="skills-container">
        {localSkills.length > 0 ? (
          localSkills.map((skill) => (
            <div 
              key={skill._id} 
              className="skill-tag-container"
            >
              <span 
                className="skill-tag"
                style={{ 
                  background: `linear-gradient(135deg, ${getSkillLevelColor(skill.level)}, ${getSkillLevelColor(skill.level)}cc)` 
                }}
              >
                {skill.skillName}
                <span className="skill-level">{skill.level}</span>
              </span>
              {isOwnProfile && (
                <button
                  className="delete-skill-btn"
                  onClick={() => handleDeleteSkill(skill._id, skill.skillName)}
                  title={`Delete ${skill.skillName}`}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="no-skills-message">
            <i className="fas fa-info-circle"></i>
            <span>No skills added yet</span>
            {isOwnProfile && (
              <button 
                onClick={showModal}
                className="add-first-skill-btn"
              >
                Add Your First Skill
              </button>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <>
          {typeof document !== 'undefined' && 
            document.body && 
            ReactDOM.createPortal(
              <div className="modal-overlay-fixed" onClick={hideModal}>
                <div className="add-skill-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Add Skill</h3>
                    <button 
                      className="close-modal-btn"
                      onClick={hideModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="add-skill-form">
                    {errors.root?.serverError && (
                      <div className="form-error general-error">
                        {errors.root.serverError.message}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="skillName">Skill *</label>
                      <Controller
                        name="skillName"
                        control={control}
                        rules={{
                          required: 'Skill name is required',
                          minLength: {
                            value: 2,
                            message: 'Skill name must be at least 2 characters long'
                          },
                          maxLength: {
                            value: 50,
                            message: 'Skill name cannot exceed 50 characters'
                          },
                          validate: {
                            notEmpty: (value) => value.trim() !== '' || 'Skill name cannot be empty',
                            noDuplicate: (value) => checkDuplicateSkill(value),
                            validCharacters: (value) => {
                              const validPattern = /^[a-zA-Z0-9\s\-\+\#\.]+$/;
                              return validPattern.test(value.trim()) || 'Skill name contains invalid characters';
                            }
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            id="skillName"
                            placeholder="Skill (ex: React, Python, Project Management)"
                            className={errors.skillName ? 'error' : ''}
                            maxLength={50}
                          />
                        )}
                      />
                      {errors.skillName && (
                        <span className="field-error">{errors.skillName.message}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="skillLevel">Level *</label>
                      <Controller
                        name="level"
                        control={control}
                        rules={{
                          required: 'Skill level is required'
                        }}
                        render={({ field }) => (
                          <select
                            {...field}
                            id="skillLevel"
                            className={errors.level ? 'error' : ''}
                          >
                            {skillLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.level && (
                        <span className="field-error">{errors.level.message}</span>
                      )}
                    </div>

                    <div className="modal-actions">
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={hideModal}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="save-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
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