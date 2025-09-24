package org.example.event;

import lombok.Getter;
import org.example.model.InternshipOffer;
import org.example.model.UserApp;
import org.springframework.context.event.EventListener;

@Getter
public class EmployerCreatedInternshipOfferEvent {
    private InternshipOffer internshipOffer;

    @EventListener
    public void  handleEmployerCreatedInternshipOfferEvent(InternshipOffer internshipOffer) {
        this.internshipOffer = internshipOffer;
    }
}
