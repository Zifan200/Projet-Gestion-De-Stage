package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.security.exception.InvalidJwtTokenException;
import org.example.security.exception.UserNotFoundException;
import org.example.service.AuthService;
import org.example.service.UserAppService;
import org.example.service.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.*;
import org.example.security.exception.UsedEmailAddressException;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	private final AuthService authService;
	private final UserAppService userService;

	@PostMapping("/login")
	public ResponseEntity<JWTAuthResponse> authenticateUser(@RequestBody LoginDTO loginDto){
		try {
			String accessToken = userService.authenticateUser(loginDto);
			final JWTAuthResponse authResponse = new JWTAuthResponse(accessToken);
			return ResponseEntity.accepted()
					.contentType(MediaType.APPLICATION_JSON)
					.body(authResponse);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new JWTAuthResponse());
		}
	}

	@PostMapping("/signin")
	public ResponseEntity<JWTAuthResponse> signIn(@RequestBody LoginDTO loginDTO) {
		try {
			String accessToken = authService.userLogin(loginDTO);
			return ResponseEntity.ok(new JWTAuthResponse(accessToken));
		}
		catch (AuthenticationCredentialsNotFoundException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new JWTAuthResponse("Veuillez fournir email et mot de passe."));
		}
		catch (LockedException e) {
			return ResponseEntity.status(HttpStatus.LOCKED)
					.body(new JWTAuthResponse(e.getMessage()));
		}
		catch (BadCredentialsException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new JWTAuthResponse("Email ou mot de passe incorrect."));
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new JWTAuthResponse("Erreur interne lors de l'authentification."));
		}
	}


	@PostMapping("/password-reset/request")
	public ResponseEntity<String> requestPasswordReset(@RequestParam String email){
		try {
			authService.userPasswordResetRequest(email);
			return ResponseEntity.status(HttpStatus.ACCEPTED).body("Email de réinitialisation envoyé.");
		}
		catch (UserNotFoundException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable.");
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Erreur lors de la demande de réinitialisation.");
		}
	}

	@PostMapping("/password-reset/confirm")
	public ResponseEntity<String> confirmPasswordReset(@RequestBody PasswordRequestDTO passwordRequestDTO) {
		try {
			authService.userPasswordReset(passwordRequestDTO);
			return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Mot de passe réinitialisé.");
		}
		catch (InvalidJwtTokenException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalide ou expiré.");
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la réinitialisation.");
		}
	}

	@GetMapping("/me")
	public ResponseEntity<UserDTO> getMe(HttpServletRequest request){
		return ResponseEntity.accepted().contentType(MediaType.APPLICATION_JSON).body(
			userService.getMe(request.getHeader("Authorization")));
	}
}
