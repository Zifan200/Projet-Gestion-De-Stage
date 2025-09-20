package org.example.event;

import lombok.Getter;
import org.example.model.InternshipOffer;
import org.example.model.UserApp;

@Getter
public class EmployerCreatedInternshipOfferEvent {
    private InternshipOffer internshipOffer;

    public EmployerCreatedInternshipOfferEvent(InternshipOffer internshipOffer) {
        this.internshipOffer = internshipOffer;
    }
}
