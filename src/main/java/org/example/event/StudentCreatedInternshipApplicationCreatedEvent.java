package org.example.event;

import org.example.model.InternshipApplication;
import org.springframework.context.event.EventListener;

public class StudentCreatedInternshipApplicationCreatedEvent {
    private InternshipApplication internshipApplication;
    @EventListener
    public void  handleStudentCreatedInternshipApplication(InternshipApplication internshipApplication) {
        this.internshipApplication = internshipApplication;
    }
}
