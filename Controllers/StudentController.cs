using System;
using System.Collections.Generic;
using System.Linq;
using CollegeManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace CollegeManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private static readonly List<Student> Students = new()
    {
        new Student { Id = "S001", Name = "Ava Johnson", Age = 20, Course = "Computer Science" },
        new Student { Id = "S002", Name = "Liam Patel", Age = 22, Course = "Business Administration" },
        new Student { Id = "S003", Name = "Mia Garcia", Age = 19, Course = "Mathematics" }
    };

    [HttpGet("getall")]
    public ActionResult<IEnumerable<Student>> GetAll()
    {
        return Ok(Students);
    }

    [HttpGet("{id}")]
    public ActionResult<Student> GetById(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest("Student id is required.");
        }

        var student = Students.FirstOrDefault(s => string.Equals(s.Id, id, StringComparison.OrdinalIgnoreCase));
        if (student is null)
        {
            return NotFound($"Student with id '{id}' was not found.");
        }

        return Ok(student);
    }

    [HttpPost("add")]
    public ActionResult<Student> Add([FromBody] Student student)
    {
        if (!TryValidateStudent(student, out var validationMessage))
        {
            return BadRequest(validationMessage);
        }

        var exists = Students.Any(s => string.Equals(s.Id, student.Id, StringComparison.OrdinalIgnoreCase));
        if (exists)
        {
            return BadRequest($"Student with id '{student.Id}' already exists.");
        }

        Students.Add(student);
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
    }

    [HttpPut("update")]
    public ActionResult<Student> Update([FromBody] Student student)
    {
        if (!TryValidateStudent(student, out var validationMessage))
        {
            return BadRequest(validationMessage);
        }

        var existingStudent = Students.FirstOrDefault(s => string.Equals(s.Id, student.Id, StringComparison.OrdinalIgnoreCase));
        if (existingStudent is null)
        {
            return NotFound($"Student with id '{student.Id}' was not found.");
        }

        existingStudent.Name = student.Name;
        existingStudent.Age = student.Age;
        existingStudent.Course = student.Course;

        return Ok(existingStudent);
    }

    [HttpDelete("delete/{id}")]
    public ActionResult<Student> Delete(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest("Student id is required.");
        }

        var student = Students.FirstOrDefault(s => string.Equals(s.Id, id, StringComparison.OrdinalIgnoreCase));
        if (student is null)
        {
            return NotFound($"Student with id '{id}' was not found.");
        }

        Students.Remove(student);
        return Ok(student);
    }

    private static bool TryValidateStudent(Student? student, out string message)
    {
        if (student is null)
        {
            message = "Student payload is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(student.Id))
        {
            message = "Student id is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(student.Name))
        {
            message = "Student name is required.";
            return false;
        }

        if (student.Age <= 0)
        {
            message = "Student age must be greater than zero.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(student.Course))
        {
            message = "Student course is required.";
            return false;
        }

        message = string.Empty;
        return true;
    }
}
