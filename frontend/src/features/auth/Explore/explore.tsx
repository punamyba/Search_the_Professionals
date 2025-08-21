import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './explore.css';
import Navbar from '../../auth/navbar/navbar';
import Footer from '../Footer/footer';

type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  type: string; // 'remote', 'fulltime', 'parttime', 'contract', 'internship'
  category: string; // 'technology', 'business', 'creative', 'healthcare', 'education'
  skills: string[];
  postedDate: string;
  isUrgent?: boolean;
}

type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export default function Explore() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Categories data
  const categories: Category[] = [
    {
      id: 'all',
      name: 'All Jobs',
      icon: 'fas fa-th-large',
      description: 'Browse all available positions',
      count: 1247
    },
    {
      id: 'technology',
      name: 'Technology',
      icon: 'fas fa-code',
      description: 'Software development, IT & tech roles',
      count: 423
    },
    {
      id: 'business',
      name: 'Business',
      icon: 'fas fa-chart-line',
      description: 'Management, finance & consulting',
      count: 312
    },
    {
      id: 'creative',
      name: 'Creative',
      icon: 'fas fa-paint-brush',
      description: 'Design, marketing & creative roles',
      count: 156
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: 'fas fa-heartbeat',
      description: 'Medical, nursing & healthcare',
      count: 189
    },
    {
      id: 'education',
      name: 'Education',
      icon: 'fas fa-graduation-cap',
      description: 'Teaching, training & educational',
      count: 167
    }
  ];

  // Sample job data (replace with API call)
  const sampleJobs: Job[] = [
    {
      _id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      description: 'Join our team to build amazing user experiences with React, TypeScript, and modern development tools. We\'re looking for someone passionate about creating intuitive interfaces.',
      location: 'Remote, Worldwide',
      salary: '$80k - $120k',
      type: 'remote',
      category: 'technology',
      skills: ['React', 'TypeScript', 'CSS', 'Node.js'],
      postedDate: '2 days ago'
    },
    {
      _id: '2',
      title: 'Product Manager',
      company: 'InnovateLab',
      description: 'Lead product strategy and development for our growing SaaS platform. Work closely with engineering and design teams to deliver exceptional products.',
      location: 'San Francisco, CA',
      salary: '$90k - $140k',
      type: 'fulltime',
      category: 'business',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      postedDate: '1 day ago'
    },
    {
      _id: '3',
      title: 'UX/UI Designer',
      company: 'Creative Studio',
      description: 'Design beautiful and intuitive interfaces for mobile and web applications. Collaborate with product teams to create user-centered design solutions.',
      location: 'New York, NY',
      salary: '$60 - $80/hr',
      type: 'contract',
      category: 'creative',
      skills: ['Figma', 'UI Design', 'Prototyping', 'User Research'],
      postedDate: '3 days ago',
      isUrgent: true
    },
    {
      _id: '4',
      title: 'Data Scientist',
      company: 'DataCorp Analytics',
      description: 'Analyze complex datasets to drive business insights. Build machine learning models and work with cross-functional teams to implement data-driven solutions.',
      location: 'Remote, US Only',
      salary: '$95k - $150k',
      type: 'remote',
      category: 'technology',
      skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
      postedDate: '5 days ago'
    },
    {
      _id: '5',
      title: 'Software Development Intern',
      company: 'StartupXYZ',
      description: 'Join our dynamic startup team as a software development intern. Work on real projects and gain hands-on experience with modern technologies.',
      location: 'Austin, TX',
      salary: '$15 - $20/hr',
      type: 'internship',
      category: 'technology',
      skills: ['JavaScript', 'React', 'Git', 'APIs'],
      postedDate: '1 week ago'
    },
    {
      _id: '6',
      title: 'Marketing Manager',
      company: 'GrowthCo',
      description: 'Lead marketing campaigns and strategies to drive user acquisition and engagement. Manage a team of marketing specialists and work with cross-functional teams.',
      location: 'Los Angeles, CA',
      salary: '$70k - $100k',
      type: 'fulltime',
      category: 'business',
      skills: ['Digital Marketing', 'SEO', 'Analytics', 'Team Leadership'],
      postedDate: '4 days ago'
    }
  ];

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }

    // Load jobs (replace with actual API call)
    loadJobs();
  }, [navigate]);

  const loadJobs = async () => {
    setLoading(true);
    setError('');

    try {
      // Replace this with actual API call
      // const token = localStorage.getItem('token');
      // const response = await fetch('http://localhost:3000/api/jobs', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   }
      // });

      // For now, using sample data
      setTimeout(() => {
        setJobs(sampleJobs);
        setFilteredJobs(sampleJobs);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Failed to load jobs');
      setLoading(false);
    }
  };

  // Filter jobs based on category, type, and search
  useEffect(() => {
    let filtered = jobs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(job => job.type === selectedFilter);
    }

    // Filter by search text
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search) ||
        job.skills.some(skill => skill.toLowerCase().includes(search))
      );
    }

    setFilteredJobs(filtered);
  }, [selectedCategory, selectedFilter, searchText, jobs]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const goToJobDetails = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  const getBadgeClass = (type: string, isUrgent?: boolean) => {
    if (isUrgent) return 'job-badge urgent';
    if (type === 'remote') return 'job-badge remote';
    return 'job-badge';
  };

  const getBadgeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'remote': 'Remote',
      'fulltime': 'Full-time',
      'parttime': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship'
    };
    return typeMap[type] || type;
  };

  return (
    <div>
      <Navbar />
      
      <div className="explore-wrapper">
        <div className="explore-content">
          
          {/* Header */}
          <div className="explore-header">
            <h1>Explore Opportunities</h1>
            <p>Find your perfect job from thousands of opportunities across different industries and locations</p>
          </div>
          
          {/* Categories Section */}
          <div className="categories-section">
            <div className="categories-header">
              <h2>Browse by Category</h2>
              <p>Select a category to see relevant job opportunities</p>
            </div>
            
            <div className="categories-grid">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <i className={`${category.icon} category-icon`}></i>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="category-count">{category.count} jobs</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-header">
              <h3 className="filters-title">Filter Results</h3>
              <span className="results-count">Showing {filteredJobs.length} jobs</span>
            </div>
            
            <div className="filter-controls">
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                className="search-filter"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
              
              <div className="filter-group">
                <span
                  className={`filter-tag ${selectedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('all')}
                >
                  All Types
                </span>
                <span
                  className={`filter-tag ${selectedFilter === 'remote' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('remote')}
                >
                  Remote
                </span>
                <span
                  className={`filter-tag ${selectedFilter === 'fulltime' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('fulltime')}
                >
                  Full-time
                </span>
                <span
                  className={`filter-tag ${selectedFilter === 'parttime' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('parttime')}
                >
                  Part-time
                </span>
                <span
                  className={`filter-tag ${selectedFilter === 'contract' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('contract')}
                >
                  Contract
                </span>
                <span
                  className={`filter-tag ${selectedFilter === 'internship' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('internship')}
                >
                  Internship
                </span>
              </div>
            </div>
          </div>
          
          {/* Jobs Section */}
          <div className="jobs-section">
            <div className="jobs-header">
              <h2>Available Positions</h2>
            </div>
            
            <div className="jobs-grid">
              {loading && (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  Loading jobs...
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{error}</p>
                  <button onClick={loadJobs}>Try Again</button>
                </div>
              )}
              
              {!loading && !error && filteredJobs.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  <h3>No jobs found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              )}
              
              {!loading && !error && filteredJobs.map(job => (
                <div
                  key={job._id}
                  className="job-card"
                  onClick={() => goToJobDetails(job._id)}
                >
                  <div className="job-card-header">
                    <div className={getBadgeClass(job.type, job.isUrgent)}>
                      {job.isUrgent ? 'Urgent' : getBadgeText(job.type)}
                    </div>
                    <h3>{job.title}</h3>
                    <div className="job-company">
                      <i className="fas fa-building"></i>
                      {job.company}
                    </div>
                  </div>
                  
                  <div className="job-card-body">
                    <p className="job-description">{job.description}</p>
                    
                    <div className="job-skills">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    
                    <div className="job-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {job.location}
                    </div>
                    
                    <div className="job-footer">
                      <span className="job-salary">{job.salary}</span>
                      <div className="job-meta">
                        <i className="fas fa-clock"></i>
                        Posted {job.postedDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}