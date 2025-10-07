package org.example.event;

import lombok.Getter;
import org.example.model.InternshipOffer;
import org.springframework.context.event.EventListener;

@Getter
public class InternshipOfferStatusChangeEvent {
    private InternshipOffer internshipOffer;

    @EventListener
    public void  handleInternshipOfferStatusChangeEvent(InternshipOffer internshipOffer) {
        this.internshipOffer = internshipOffer;
    }
}
