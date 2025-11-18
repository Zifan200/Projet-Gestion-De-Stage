import { render, screen } from "@testing-library/react";
import { Header } from "./header.jsx";

describe('tests de header', () => {
    it('should render the Header', async () => {
        render(<Header title={"Test de header"} />);
        const text = screen.getByRole("heading")
        expect(text).toBeInTheDocument();
    })
})