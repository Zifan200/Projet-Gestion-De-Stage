package org.example.event;

import lombok.Getter;
import org.example.model.InternshipApplication;
import org.springframework.context.event.EventListener;

@Getter
public class InternshipApplicationStatusChangeEvent {
    private InternshipApplication internshipApplication;

    @EventListener
    public void  handleInternshipApplicationStatusChangeEvent(InternshipApplication internshipApplication) {
        this.internshipApplication = internshipApplication;
    }
}
