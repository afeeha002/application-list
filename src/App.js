import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://rest-backend-prosevo.onrender.com/students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setIsEditing(false); // Set to adding mode
    reset(); // Reset form
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    reset(); // Reset form
    setSelectedStudent(null); // Clear selected student
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing && selectedStudent) {
        // Update existing student
        await axios.put(`https://rest-backend-prosevo.onrender.com/students/${selectedStudent._id}`, data);
        toast.success('Student updated successfully');
      } else {
        // Add new student
        await axios.post('https://rest-backend-prosevo.onrender.com/students', data);
        toast.success('Student added successfully');
      }
      fetchStudents(); // Refresh the list
      handleClose();
    } catch (error) {
      toast.error('Error saving student');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`https://rest-backend-prosevo.onrender.com/students/${selectedStudent._id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
      handleClose();
    } catch (error) {
      toast.error('Error deleting student');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student); // Set the selected student
    setValue("name", student.name);  // Set values to the form fields
    setValue("age", student.age);
    setValue("class", student.class);
    setValue("subject", student.subject);
    setIsEditing(true); // Set to editing mode
    setShowModal(true); // Show the modal
  };

  return (
    <div className="App container-fluid px-5">
      <h1 className="my-4">Student List</h1>
      <button type="button" className="btn btn-primary mb-4" onClick={handleShow}>
        Add Student
      </button>

      {loading && <div className="text-center"><strong>Loading...</strong></div>}

      <div className="d-flex flex-column gap-1">
        {students.map((item) => (
          <div key={item._id} className="d-flex justify-content-between align-items-center border rounded-3 p-3 bg-light">
            <span className="text-dark">{item.name}</span>
            <button className="btn btn-success" onClick={() => handleView(item)}>View</button>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Student */}
      {showModal && (
        <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? 'Edit Student' : 'Add New Student'}</h5>
                <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      {...register('name', { required: 'Name is required', minLength: { value: 3, message: 'Name must be at least 3 characters long' }, maxLength: { value: 20, message: 'Name must be at most 20 characters long' } })}
                    />
                    {errors.name && <span className="text-danger">{errors.name.message}</span>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      id="age"
                      {...register('age', { required: 'Age is required', min: { value: 1, message: 'Age must be at least 1' }, max: { value: 120, message: 'Age must be at most 120' } })}
                    />
                    {errors.age && <span className="text-danger">{errors.age.message}</span>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="class" className="form-label">Class</label>
                    <input
                      type="text"
                      className="form-control"
                      id="class"
                      {...register('class', { required: 'Class is required' })}
                    />
                    {errors.class && <span className="text-danger">{errors.class.message}</span>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      {...register('subject', { required: 'Subject is required' })}
                    />
                    {errors.subject && <span className="text-danger">{errors.subject.message}</span>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                    {isEditing && (
                      <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Update Student' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
}

export default App;