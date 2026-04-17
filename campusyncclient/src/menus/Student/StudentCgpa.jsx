import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';

const gradePoints = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'U': 0
};

export default function StudentCgpa() {
  const [courses, setCourses] = useState([
    { id: Date.now(), subject: '', credits: 3, grade: 'A' }
  ]);
  const [semester, setSemester] = useState(1);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getcgpa");
      // Filter for active user like the leave portal
      const userOptions = JSON.parse(localStorage.getItem('user')) || { name: 'Student' };
      const myHistory = res.data.filter(item => item.name === userOptions.name);
      setHistory(myHistory);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseChange = (id, field, value) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), subject: '', credits: 3, grade: 'A' }]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  // Calculate GPA
  let totalCredits = 0;
  let earnedPoints = 0;

  courses.forEach(course => {
    const cred = parseFloat(course.credits) || 0;
    const gp = gradePoints[course.grade] || 0;
    totalCredits += cred;
    earnedPoints += (cred * gp);
  });

  const currentGpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : 0.00;

  const saveCgpa = async () => {
    try {
      await axios.post("http://localhost:5000/savecgpa", {
        name: JSON.parse(localStorage.getItem('user'))?.name || 'Student',
        reg: "9123128001",
        semester: parseInt(semester),
        gpa: parseFloat(currentGpa),
        total_credits: totalCredits
      });
      alert("GPA saved successfully!");
      fetchHistory(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to save GPA");
    }
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <div className="mb-4">
        <h3 className="fw-bold">CGPA Calculator</h3>
        <p className="text-muted small">Calculate your current semester GPA and save your overall academic record.</p>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Subject Grades</h5>
              <Form.Select 
                className="w-auto fw-bold text-primary bg-primary bg-opacity-10 border-0" 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                {[1,2,3,4,5,6,7,8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
              </Form.Select>
            </Card.Header>
            <Card.Body className="p-4">
              <Table borderless className="align-middle">
                <thead className="text-muted small">
                  <tr className="border-bottom">
                    <th>Subject Title</th>
                    <th style={{ width: '150px' }}>Credits</th>
                    <th style={{ width: '150px' }}>Grade</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <Form.Control 
                          type="text" 
                          placeholder="e.g. Data Structures" 
                          value={course.subject}
                          onChange={(e) => handleCourseChange(course.id, 'subject', e.target.value)}
                          className="bg-light border-0 py-2"
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="number" 
                          min="1" max="6"
                          value={course.credits}
                          onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                          className="bg-light border-0 py-2"
                        />
                      </td>
                      <td>
                        <Form.Select 
                          value={course.grade}
                          onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
                          className="bg-light border-0 py-2 fw-bold"
                        >
                          {Object.keys(gradePoints).map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </Form.Select>
                      </td>
                      <td className="text-end">
                        <Button variant="link" className="text-danger p-0" onClick={() => removeCourse(course.id)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Button variant="outline-primary" className="rounded-pill px-4 mt-2 mb-3" onClick={addCourse}>
                <FaPlus className="me-2" /> Add Subject
              </Button>

            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 text-center mb-4 p-4 text-white bg-primary">
            <h5 className="mb-0 fw-bold opacity-75">Semester {semester} GPA</h5>
            <h1 className="display-1 fw-bold my-3">{currentGpa}</h1>
            <div>
              <Badge bg="white" text="primary" className="px-3 py-2 me-2">Credits: {totalCredits}</Badge>
              <Badge bg="white" text="primary" className="px-3 py-2">Points: {earnedPoints}</Badge>
            </div>
            <Button variant="light" className="w-100 fw-bold mt-4 shadow-sm" onClick={saveCgpa}>
              <FaSave className="me-2" /> Save to Profile
            </Button>
          </Card>

          <Card className="border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3">Academic History</h5>
            {history.length > 0 ? (
              <Table size="sm" className="mb-0">
                <thead className="text-muted small">
                  <tr>
                    <th>Semester</th>
                    <th>Credits</th>
                    <th className="text-end">Saved GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">Sem {item.semester}</td>
                      <td>{item.total_credits}</td>
                      <td className="text-end text-primary fw-bold">{item.gpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted small text-center my-3">No history recorded yet.</p>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
